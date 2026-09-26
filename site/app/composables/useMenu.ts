import type { Category, Dish } from '~/types'

type RawMenuRow = { 0: Omit<Dish, 'commentCount'>; commentCount: string | number } | (Omit<Dish, 'commentCount'> & { commentCount?: number })

export function normalizeDishes(rows: RawMenuRow[] | null | undefined): Dish[] {
  return (rows ?? []).map((row) => {
    const dish = (0 in row ? row[0] : row) as Omit<Dish, 'commentCount'>
    return { ...dish, commentCount: Number((row as { commentCount?: number | string }).commentCount ?? 0) }
  })
}

/**
 * Carte complète. Pré-rendue au build pour le référencement, puis rafraîchie
 * dans le navigateur pour afficher les derniers prix et plats.
 */
export async function useMenu() {
  const { public: config } = useRuntimeConfig()
  const base = `${config.apiBase}/api`

  const menu = useAsyncData('menu', async () => {
    const [rows, categories] = await Promise.all([
      $fetch<RawMenuRow[]>(`${base}/menu`).catch(() => []),
      $fetch<Category[]>(`${base}/categories`).catch(() => []),
    ])
    return { dishes: normalizeDishes(rows), categories: categories.map(({ id, title, content }) => ({ id, title, content })) }
  })

  // Enregistré avant tout « await » pour rester rattaché au composant.
  if (import.meta.client && getCurrentInstance()) {
    onMounted(() => menu.refresh())
  }
  await menu

  const dishes = computed(() => menu.data.value?.dishes ?? [])
  const categories = computed(() =>
    (menu.data.value?.categories ?? []).filter((c) => dishes.value.some((d) => d.category?.id === c.id)),
  )

  return { dishes, categories, pending: menu.pending, error: menu.error, refresh: menu.refresh }
}
