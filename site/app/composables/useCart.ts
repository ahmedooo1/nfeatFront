import type { CartLine, Dish } from '~/types'

const GUEST_KEY = 'nfeat_guest_cart'

/**
 * Panier : côté serveur pour un client connecté ; dans le navigateur pour un
 * visiteur, puis fusionné dans son compte à la connexion.
 */
export function useCart() {
  const api = useApi()
  const lines = useState<CartLine[]>('cart:lines', () => [])
  const open = useState('cart:open', () => false)
  const loading = useState('cart:loading', () => false)
  const token = useToken()

  const count = computed(() => lines.value.reduce((n, l) => n + l.quantity, 0))
  const total = computed(() => lines.value.reduce((s, l) => s + Number(l.price) * l.quantity, 0))
  const hasUnavailable = computed(() => lines.value.some((l) => l.available === false))

  const readGuest = (): CartLine[] => {
    if (!import.meta.client) return []
    try {
      return JSON.parse(localStorage.getItem(GUEST_KEY) || '[]')
    } catch {
      return []
    }
  }
  const writeGuest = () => import.meta.client && localStorage.setItem(GUEST_KEY, JSON.stringify(lines.value))

  async function refresh() {
    if (!token.value) {
      lines.value = readGuest()
      return
    }
    loading.value = true
    try {
      const rows = await api<(CartLine & { cartId: number })[]>('/carts')
      lines.value = rows.map(({ menuItemId, name, price, image_url, quantity, description, available }) => ({ menuItemId, name, price, image_url, quantity, description, available }))
    } finally {
      loading.value = false
    }
  }

  async function add(dish: Pick<Dish, 'id' | 'name' | 'price' | 'image_url'>, quantity = 1) {
    if (token.value) {
      await api('/carts', { method: 'POST', body: { menuItemId: dish.id, quantity } })
      await refresh()
    } else {
      const line = lines.value.find((l) => l.menuItemId === dish.id)
      if (line) line.quantity = Math.min(50, line.quantity + quantity)
      else lines.value.push({ menuItemId: dish.id, name: dish.name, price: dish.price, image_url: dish.image_url, quantity })
      writeGuest()
    }
    useToast().success(`${dish.name} ajouté au panier`, { label: 'Voir', to: '/panier' })
  }

  async function setQuantity(menuItemId: number, quantity: number) {
    const line = lines.value.find((l) => l.menuItemId === menuItemId)
    if (!line) return
    if (quantity <= 0) return remove(menuItemId)
    const previous = line.quantity
    line.quantity = Math.min(50, quantity)
    if (!token.value) return writeGuest()
    try {
      // L'API ajoute des quantités : on retire la ligne puis on la recrée.
      await api('/cart/item', { method: 'DELETE', body: { menuItemId } })
      await api('/carts', { method: 'POST', body: { menuItemId, quantity: line.quantity } })
    } catch (e) {
      line.quantity = previous
      useToast().error(apiMessage(e))
    }
  }

  async function remove(menuItemId: number) {
    lines.value = lines.value.filter((l) => l.menuItemId !== menuItemId)
    if (!token.value) return writeGuest()
    await api('/cart/item', { method: 'DELETE', body: { menuItemId } }).catch(() => refresh())
  }

  async function clear() {
    lines.value = []
    if (token.value) await api('/cart/empty', { method: 'POST' }).catch(() => {})
    else writeGuest()
  }

  /** À la connexion : le panier du visiteur rejoint celui du compte. */
  async function mergeGuestCart() {
    const guest = readGuest()
    for (const line of guest) {
      await api('/carts', { method: 'POST', body: { menuItemId: line.menuItemId, quantity: line.quantity } }).catch(() => {})
    }
    if (import.meta.client) localStorage.removeItem(GUEST_KEY)
    await refresh()
  }

  function reset() {
    lines.value = readGuest()
  }

  return { lines, open, loading, count, total, hasUnavailable, refresh, add, setQuantity, remove, clear, mergeGuestCart, reset }
}
