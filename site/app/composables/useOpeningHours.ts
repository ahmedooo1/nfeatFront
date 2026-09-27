import { restaurant } from '~/restaurant.config'

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h! * 60 + m!
}

/** « Ouvert maintenant » calculé à l'heure de Paris. */
export function useOpeningHours() {
  const now = useState('clock', () => Date.now())
  if (import.meta.client) {
    onMounted(() => {
      const t = setInterval(() => (now.value = Date.now()), 60_000)
      onBeforeUnmount(() => clearInterval(t))
    })
  }

  const status = computed(() => {
    const paris = new Date(new Date(now.value).toLocaleString('en-US', { timeZone: 'Europe/Paris' }))
    const day = paris.getDay()
    const minutes = paris.getHours() * 60 + paris.getMinutes()
    const today = restaurant.hours.find((h) => (h.days as readonly number[]).includes(day))
    if (today && minutes >= toMinutes(today.open) && minutes < toMinutes(today.close)) {
      return { open: true, label: `Ouvert jusqu’à ${formatHour(today.close)}` }
    }
    if (today && minutes < toMinutes(today.open)) return { open: false, label: `Fermé, ouverture à ${formatHour(today.open)}` }
    return { open: false, label: 'Fermé pour aujourd’hui' }
  })

  return { status, hours: restaurant.hours }
}
