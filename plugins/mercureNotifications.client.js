import Vue from 'vue'

// Shared bus so the notifications page can react to the same live stream
// without opening a second EventSource connection to the hub.
export const notifBus = new Vue()

const MERCURE_TOPIC = 'https://apinfeat.aaweb.fr/orders/notifications'
const MERCURE_PUBLIC_URL = 'https://apinfeat.aaweb.fr/.well-known/mercure'
const RECONCILE_POLL_MS = 5 * 60 * 1000 // safety net only; push handles the real-time case

export default function (context) {
  const { store, $axios, app } = context

  let eventSource = null
  let audio = null
  let unlocked = false
  let connected = false

  function isAdmin() {
    return !!(app.$auth.loggedIn && app.$auth.user?.roles?.includes('ROLE_ADMIN'))
  }

  function unlockAudio() {
    if (unlocked || !audio) return
    audio.play()
      .then(() => {
        audio.pause()
        audio.currentTime = 0
        unlocked = true
        store.commit('notifications/SET_SOUND_ENABLED', true)
      })
      .catch(() => {
        // Will retry on the next click - browsers vary on exactly which
        // gesture qualifies, no need to surface an error for this.
      })
  }

  function playSound() {
    if (!unlocked || !audio) return
    audio.play().catch((error) => {
      console.error('Notification sound failed to play', error)
    })
  }

  async function connect() {
    if (connected || !isAdmin()) return
    connected = true

    audio = new Audio('/sounds/notif.mp3')
    // Any click anywhere in the app counts as the required user gesture -
    // avoids forcing a dedicated "enable sound" click on the notifications
    // page specifically before every new page load.
    document.addEventListener('click', unlockAudio, { once: true })

    try {
      await $axios.get('/admin/mercure-token', { withCredentials: true })
    } catch (error) {
      console.error('Failed to obtain Mercure subscriber token, live notifications disabled', error)
      connected = false
      return
    }

    const url = `${MERCURE_PUBLIC_URL}?topic=${encodeURIComponent(MERCURE_TOPIC)}`
    eventSource = new EventSource(url, { withCredentials: true })

    eventSource.onopen = () => {
      store.commit('notifications/SET_LIVE_CONNECTED', true)
    }

    eventSource.onmessage = (event) => {
      let raw
      try {
        raw = JSON.parse(event.data)
      } catch (error) {
        console.error('Invalid notification payload', error)
        return
      }

      store.commit('notifications/NOTE_NEW_ORDER', raw.id)
      playSound()
      app.$toast.success(`Nouvelle commande de ${raw.user.name}`)
      notifBus.$emit('new-notification', raw)
    }

    eventSource.onerror = () => {
      store.commit('notifications/SET_LIVE_CONNECTED', false)
    }
  }

  function disconnect() {
    if (eventSource) {
      eventSource.close()
      eventSource = null
    }
    document.removeEventListener('click', unlockAudio)
    connected = false
    store.commit('notifications/SET_LIVE_CONNECTED', false)
  }

  function syncConnection() {
    if (isAdmin()) {
      connect()
    } else if (connected) {
      disconnect()
    }
  }

  // @nuxtjs/auth-next exposes $auth as a plain reactive object, not a
  // component - re-check on every route change, which naturally covers
  // login/logout since both trigger a redirect.
  app.router.afterEach(() => {
    syncConnection()
  })
  syncConnection()

  // Safety-net reconciliation in case a push is missed (dropped connection,
  // backgrounded tab) - deliberately infrequent since this is a fallback,
  // not the primary delivery mechanism.
  setInterval(async () => {
    if (!isAdmin()) return
    try {
      const response = await $axios.get('/admin/notifications', { params: { page: 1, limit: 1 } })
      const latestId = response.data.data[0]?.id
      if (latestId != null) {
        store.commit('notifications/RECONCILE_LATEST_ID', latestId)
      }
    } catch (error) {
      console.error('Notification reconciliation poll failed', error)
    }
  }, RECONCILE_POLL_MS)
}
