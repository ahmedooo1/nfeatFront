export const state = () => ({
  unreadCount: 0,
  liveConnected: false,
  soundEnabled: false,
  knownLatestId: null
})

export const mutations = {
  SET_LIVE_CONNECTED(state, value) {
    state.liveConnected = value
  },
  SET_SOUND_ENABLED(state, value) {
    state.soundEnabled = value
  },
  // A confirmed live push: bump the badge and remember this as the newest
  // order we know about, so the fallback reconciliation poll doesn't
  // double-count it later.
  NOTE_NEW_ORDER(state, id) {
    state.unreadCount += 1
    if (id != null && (state.knownLatestId === null || id > state.knownLatestId)) {
      state.knownLatestId = id
    }
  },
  // Fallback path: the poll only knows the single newest ID, not how many
  // are new, so a missed push just surfaces as "at least one unread"
  // rather than an exact count.
  RECONCILE_LATEST_ID(state, latestId) {
    if (state.knownLatestId !== null && latestId > state.knownLatestId) {
      state.unreadCount += 1
    }
    if (state.knownLatestId === null || latestId > state.knownLatestId) {
      state.knownLatestId = latestId
    }
  },
  RESET_UNREAD(state, latestId) {
    state.unreadCount = 0
    if (latestId != null) state.knownLatestId = latestId
  }
}
