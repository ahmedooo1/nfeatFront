type Choice = 'accepted' | 'refused' | null

/**
 * Consentement aux cookies de mesure d'audience. Google Analytics n'est
 * chargé qu'après un accord explicite (RGPD).
 */
export function useConsent() {
  const choice = useCookie<Choice>('nfeat_consent', { maxAge: 60 * 60 * 24 * 180, sameSite: 'lax' })
  const bannerOpen = useState('consent:open', () => false)

  function loadAnalytics() {
    if (!import.meta.client || (window as { gtag?: unknown }).gtag) return
    const id = useRuntimeConfig().public.gaId
    if (!id) return
    const s = document.createElement('script')
    s.async = true
    s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`
    document.head.appendChild(s)
    const w = window as unknown as { dataLayer: unknown[]; gtag: (...a: unknown[]) => void }
    w.dataLayer = w.dataLayer || []
    w.gtag = function () { w.dataLayer.push(arguments) } // eslint-disable-line prefer-rest-params
    w.gtag('js', new Date())
    w.gtag('config', id, { anonymize_ip: true })
  }

  function accept() {
    choice.value = 'accepted'
    bannerOpen.value = false
    loadAnalytics()
  }
  function refuse() {
    choice.value = 'refused'
    bannerOpen.value = false
  }
  function reopen() {
    bannerOpen.value = true
  }
  function init() {
    if (choice.value === 'accepted') loadAnalytics()
    else if (!choice.value) bannerOpen.value = true
  }

  return { choice, bannerOpen, accept, refuse, reopen, init }
}
