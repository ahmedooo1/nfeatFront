const euro = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })

export const formatPrice = (value: number | string | null | undefined) => euro.format(Number(value ?? 0))

export const formatDate = (iso: string, opts: Intl.DateTimeFormatOptions = { dateStyle: 'long', timeStyle: 'short' }) =>
  new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', ...opts }).format(new Date(iso))

export const initials = (name?: string | null) =>
  (name || '?').split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join('')

/** « 09:00 » devient « 9h », « 11:30 » devient « 11h30 ». */
export const formatHour = (hhmm: string) => {
  const [h, m] = hhmm.split(':')
  return `${Number(h)}h${m === '00' ? '' : m}`
}

const parisDay = (d: Date) => d.toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris' })

/** Heure d'un créneau à Paris : « 13h45 ». */
export const formatTime = (iso: string) => {
  const [h, m] = new Date(iso).toLocaleTimeString('fr-FR', { timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit' }).split(':')
  return formatHour(`${h}:${m}`)
}

/** « aujourd’hui », « demain » ou « samedi 3 octobre ». */
export const formatDay = (iso: string) => {
  const d = new Date(iso)
  const today = new Date()
  const tomorrow = new Date(today.getTime() + 86_400_000)
  if (parisDay(d) === parisDay(today)) return 'aujourd’hui'
  if (parisDay(d) === parisDay(tomorrow)) return 'demain'
  return d.toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris', weekday: 'long', day: 'numeric', month: 'long' })
}

/** « aujourd’hui à 13h45 ». */
export const formatPickup = (iso: string | null | undefined) => (iso ? `${formatDay(iso)} à ${formatTime(iso)}` : '-')

export const orderStatus: Record<string, { label: string; tone: string }> = {
  received: { label: 'Reçue', tone: 'bg-blue-500/20 text-blue-200' },
  preparing: { label: 'En préparation', tone: 'bg-brand/20 text-brand' },
  ready: { label: 'Prête', tone: 'bg-green-500/20 text-green-300' },
  collected: { label: 'Récupérée', tone: 'bg-white/10 text-gray-300' },
  cancelled: { label: 'Annulée', tone: 'bg-red-500/20 text-red-300' },
}

export const isActiveOrder = (status: string) => ['received', 'preparing', 'ready'].includes(status)
