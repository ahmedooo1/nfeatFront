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
