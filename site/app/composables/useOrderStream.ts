export interface LiveOrder {
  id: number
  user: { name: string | null; email: string }
  details: string
  totalPrice: number
  createdAt: string
}

/**
 * Commandes en direct (Mercure). Le jeton d'abonnement est posé en cookie
 * par l'API, réservée aux administrateurs.
 */
export function useOrderStream(onOrder: (o: LiveOrder) => void) {
  const { public: config } = useRuntimeConfig()
  const api = useApi()
  const connected = ref(false)
  const sound = ref(true)
  let source: EventSource | null = null
  let audio: HTMLAudioElement | null = null

  async function connect() {
    audio = new Audio('/sounds/notif.mp3')
    try {
      await api('/admin/mercure-token', { credentials: 'include' })
    } catch {
      return
    }
    const url = `${config.mercureUrl}?topic=${encodeURIComponent(config.mercureTopic)}`
    source = new EventSource(url, { withCredentials: true })
    source.onopen = () => (connected.value = true)
    source.onerror = () => (connected.value = false)
    source.onmessage = (event) => {
      try {
        const order = JSON.parse(event.data) as LiveOrder
        onOrder(order)
        if (sound.value) audio?.play().catch(() => {})
      } catch {
        /* message ignoré */
      }
    }
  }

  onMounted(connect)
  onBeforeUnmount(() => source?.close())
  return { connected, sound }
}
