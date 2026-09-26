const euro = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })

export const formatPrice = (value: number | string | null | undefined) => euro.format(Number(value ?? 0))

export const formatDate = (iso: string, opts: Intl.DateTimeFormatOptions = { dateStyle: 'long', timeStyle: 'short' }) =>
  new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', ...opts }).format(new Date(iso))

export const initials = (name?: string | null) =>
  (name || '?').split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join('')

/** Emoji de repli quand un plat n'a pas encore de photo. */
export function dishEmoji(text = ''): string {
  const t = text.toLowerCase()
  const table: [RegExp, string][] = [
    [/dessert|baklava|gâteau|gateau|kunafa|knafeh|glace/, '🍯'],
    [/boisson|jus|thé|the |café|cafe|limonade|ayran/, '🫖'],
    [/salade|taboul|fattouch/, '🥗'],
    [/soupe|chorba|lentille/, '🍲'],
    [/falafel|houmous|hummus|mezze|mutabal|entrée|entree/, '🧆'],
    [/sandwich|wrap|chawarma|shawarma|kebab|durum/, '🌯'],
    [/pizza|manakish|mana'?eesh/, '🫓'],
    [/burger/, '🍔'],
    [/poulet|chicken|brochette|grill|agneau|kefta|viande/, '🍢'],
    [/riz|mandi|kabsa|maqlouba/, '🍛'],
  ]
  return table.find(([re]) => re.test(t))?.[1] ?? '🍽️'
}
