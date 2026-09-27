<script setup lang="ts">
import type { OrderSummary } from '~/types'
import type { LiveOrder } from '~/composables/useOrderStream'

definePageMeta({ layout: 'admin', middleware: 'admin', alias: ['/admin/dashboard', '/admin/notifications'] })
useSeoMeta({ title: 'Tableau de bord', robots: 'noindex' })

const api = useApi()
const toast = useToast()
const stats = ref<{ userCount: number; orderCount: number; paidOrdersCount: number } | null>(null)
const orders = ref<OrderSummary[]>([])
const live = ref<LiveOrder[]>([])

async function load() {
  const [s, o] = await Promise.all([
    api<typeof stats.value>('/admin/stats').catch(() => null),
    api<{ data: OrderSummary[] }>('/admin/orders', { query: { limit: 50 } }).catch(() => ({ data: [] })),
  ])
  stats.value = s
  orders.value = o.data
}
onMounted(load)

const { connected, sound } = useOrderStream((o) => {
  live.value.unshift(o)
  toast.success(`Nouvelle commande de ${o.user.name ?? o.user.email}, ${formatPrice(o.totalPrice)}`)
  load()
})

const today = computed(() => {
  const key = new Date().toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris' })
  const list = orders.value.filter((o) => new Date(o.createdAt).toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris' }) === key)
  return { count: list.length, revenue: list.reduce((s, o) => s + o.total, 0) }
})
const average = computed(() => (orders.value.length ? orders.value.reduce((s, o) => s + o.total, 0) / orders.value.length : 0))

// Ventes des 7 derniers jours, pour le graphique.
const week = computed(() => {
  const days = [...Array(7)].map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return { key: d.toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris' }), label: d.toLocaleDateString('fr-FR', { weekday: 'short' }), total: 0 }
  })
  for (const o of orders.value) {
    const k = new Date(o.createdAt).toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris' })
    const day = days.find((d) => d.key === k)
    if (day) day.total += o.total
  }
  const max = Math.max(1, ...days.map((d) => d.total))
  return days.map((d) => ({ ...d, pct: Math.round((d.total / max) * 100) }))
})

const topDishes = computed(() => {
  const count = new Map<string, number>()
  for (const o of orders.value) for (const i of o.items) count.set(i.name, (count.get(i.name) ?? 0) + i.quantity)
  return [...count.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)
})
</script>

<template>
  <div>
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="mt-2 text-4xl font-bold">Tableau de bord</h1>
      </div>
      <div class="flex items-center gap-2">
        <span class="flex items-center gap-2 rounded-full bg-tile px-4 py-2 text-xs font-bold">
          <span class="h-2.5 w-2.5 rounded-full" :class="connected ? 'bg-green-500/200' : 'bg-sand'" />
          {{ connected ? 'Commandes en direct' : 'Direct indisponible' }}
        </span>
        <button class="grid h-9 w-9 place-items-center rounded-full bg-tile" :aria-label="sound ? 'Couper le son' : 'Activer le son'" @click="sound = !sound">
          <Icon name="bell" :size="16" :class="sound ? 'text-brand' : 'text-gray-300'" />
        </button>
      </div>
    </div>

    <div class="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div class="card p-6">
        <p class="label">Aujourd’hui</p>
        <p class="text-4xl font-bold">{{ formatPrice(today.revenue) }}</p>
        <p class="mt-1 text-sm text-gray-300">{{ today.count }} commande{{ today.count > 1 ? 's' : '' }}</p>
      </div>
      <div class="card p-6"><p class="label">Commandes</p><p class="text-4xl font-bold">{{ stats?.orderCount ?? '-' }}</p><p class="mt-1 text-sm text-gray-300">{{ stats?.paidOrdersCount ?? 0 }} payées</p></div>
      <div class="card p-6"><p class="label">Panier moyen</p><p class="text-4xl font-bold">{{ formatPrice(average) }}</p><p class="mt-1 text-sm text-gray-300">sur les 50 dernières</p></div>
      <div class="card p-6"><p class="label">Clients</p><p class="text-4xl font-bold">{{ stats?.userCount ?? '-' }}</p><p class="mt-1 text-sm text-gray-300">comptes créés</p></div>
    </div>

    <div class="mt-6 grid gap-6 xl:grid-cols-3">
      <section class="card p-6 xl:col-span-2">
        <h2 class="text-2xl font-semibold">Ventes des 7 derniers jours</h2>
        <div class="mt-10 flex h-56 items-end gap-3">
          <div v-for="d in week" :key="d.key" class="flex h-full flex-1 flex-col items-center gap-2">
            <div class="relative w-full flex-1">
              <div class="absolute inset-x-0 bottom-0 flex flex-col items-center" :style="{ height: `${Math.max(d.pct, 3)}%` }">
                <span class="absolute -top-6 whitespace-nowrap text-xs font-bold tabular-nums text-gray-300">{{ d.total ? formatPrice(d.total) : '' }}</span>
                <div class="h-full w-full rounded-t-xl bg-gradient-to-t from-brand-dark to-brand" :class="d.total ? '' : 'opacity-20'" />
              </div>
            </div>
            <span class="text-xs font-semibold capitalize text-gray-300">{{ d.label }}</span>
          </div>
        </div>
      </section>
      <section class="card p-6">
        <h2 class="text-2xl font-semibold">Plats les plus vendus</h2>
        <ol class="mt-5 space-y-3">
          <li v-for="([name, qty], i) in topDishes" :key="name" class="flex items-center gap-3">
            <span class="grid h-8 w-8 place-items-center rounded-full bg-gray-700 font-bold">{{ i + 1 }}</span>
            <span class="flex-1 truncate font-semibold">{{ name }}</span>
            <span class="text-sm text-gray-300">{{ qty }} vendu{{ qty > 1 ? 's' : '' }}</span>
          </li>
          <li v-if="!topDishes.length" class="text-sm text-gray-300">Pas encore de ventes.</li>
        </ol>
      </section>
    </div>

    <section class="card mt-6 overflow-hidden">
      <div class="flex items-center justify-between p-6">
        <h2 class="text-2xl font-semibold">Dernières commandes</h2>
        <NuxtLink to="/admin/commandes" class="text-sm font-bold text-brand hover:underline">Tout voir</NuxtLink>
      </div>
      <div v-if="live.length" class="mx-6 mb-4 space-y-2">
        <div v-for="o in live" :key="`live-${o.id}`" class="flex items-center gap-3 rounded-lg bg-green-500/20 px-4 py-3 text-sm">
          <span class="h-2.5 w-2.5 animate-pulse rounded-full bg-green-500/200" />
          <span class="font-bold">{{ o.user.name ?? o.user.email }}</span>
          <span class="flex-1 truncate text-gray-300">{{ o.details }}</span>
          <span class="font-bold">{{ formatPrice(o.totalPrice) }}</span>
        </div>
      </div>
      <AdminOrdersTable :orders="orders.slice(0, 8)" />
    </section>
  </div>
</template>
