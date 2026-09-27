<script setup lang="ts">
import { restaurant } from '~/restaurant.config'
import type { OrderSummary } from '~/types'

definePageMeta({ middleware: 'auth' })
useSeoMeta({ title: 'Suivi de commande', robots: 'noindex' })

const route = useRoute()
const api = useApi()
const { user } = useAuth()
const order = ref<OrderSummary | null>(null)
const missing = ref(false)
const justPlaced = computed(() => route.query.new === '1')

const steps = [
  { key: 'received', label: 'Reçue' },
  { key: 'preparing', label: 'En préparation' },
  { key: 'ready', label: 'Prête' },
  { key: 'collected', label: 'Récupérée' },
]
const current = computed(() => steps.findIndex((s) => s.key === order.value?.status))

const message = computed(() => ({
  received: 'Le restaurant a bien reçu votre commande.',
  preparing: 'Votre commande est en préparation.',
  ready: 'Votre commande est prête, vous pouvez venir la chercher.',
  collected: 'Commande récupérée. Bon appétit !',
  cancelled: 'Cette commande a été annulée par le restaurant. Contactez-nous pour plus d’informations.',
})[order.value?.status ?? 'received'])

const payment = computed(() => {
  const o = order.value
  if (!o) return ''
  if (o.paymentMethod === 'card') return 'Payée en ligne'
  return o.isPaid ? 'Réglée au restaurant' : `À régler au retrait : ${formatPrice(o.total)}`
})

async function load() {
  const id = Number(route.query.id)
  if (!id) {
    missing.value = true
    return
  }
  try {
    order.value = await api<OrderSummary>(`/orders/${id}`)
  } catch {
    missing.value = true
  }
}

// Le statut change en cuisine : relu régulièrement tant que la commande est en cours.
let timer: ReturnType<typeof setInterval> | undefined
onMounted(async () => {
  await load()
  timer = setInterval(() => {
    if (order.value && isActiveOrder(order.value.status) && document.visibilityState === 'visible') load()
  }, 20_000)
})
onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <div class="container-x max-w-3xl py-12 sm:py-16">
    <div v-if="missing" class="card p-12 text-center">
      <p class="text-2xl">Commande introuvable.</p>
      <NuxtLink to="/compte/commandes" class="btn-primary mt-6">Mes commandes</NuxtLink>
    </div>

    <div v-else-if="!order" class="space-y-4"><div class="skeleton h-40" /><div class="skeleton h-64" /></div>

    <template v-else>
      <div v-if="justPlaced" class="no-print text-center">
        <span class="mx-auto grid h-16 w-16 place-items-center rounded-full bg-green-600 text-white shadow-xl"><Icon name="check" :size="32" :stroke="2.6" /></span>
        <h1 class="mt-5 text-3xl font-bold sm:text-4xl">Merci {{ user?.name?.split(' ')[0] }} !</h1>
        <p class="mt-2 text-gray-300">Commande envoyée au restaurant.</p>
      </div>
      <h1 v-else class="text-3xl font-bold sm:text-4xl">Commande #{{ order.id }}</h1>

      <section class="card no-print mt-8 p-6 sm:p-8">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p class="label">{{ order.status === 'collected' ? 'Retirée' : 'Retrait prévu' }}</p>
            <p class="text-3xl font-bold text-brand first-letter:uppercase">{{ formatPickup(order.pickupAt) }}</p>
          </div>
          <span class="rounded-full px-4 py-1.5 text-sm font-bold" :class="orderStatus[order.status]?.tone">{{ orderStatus[order.status]?.label }}</span>
        </div>

        <ol v-if="order.status !== 'cancelled'" class="mt-8 grid grid-cols-4 gap-2" aria-label="Avancement">
          <li v-for="(s, i) in steps" :key="s.key" class="text-center">
            <div class="h-2 rounded-full" :class="i <= current ? 'bg-brand' : 'bg-white/10'" />
            <p class="mt-2 text-xs sm:text-sm" :class="i === current ? 'font-bold text-white' : 'text-gray-400'">{{ s.label }}</p>
          </li>
        </ol>
        <p class="mt-6" :class="order.status === 'cancelled' ? 'text-red-300' : 'text-gray-100'">{{ message }}</p>
        <p v-if="isActiveOrder(order.status)" class="mt-1 text-xs text-gray-400">Cette page se met à jour toute seule.</p>
      </section>

      <article class="card mt-6 overflow-hidden">
        <div class="flex items-center justify-between bg-gray-900 px-6 py-5 sm:px-8">
          <BrandMark light />
          <span class="rounded-full bg-brand px-4 py-1.5 text-lg font-bold">#{{ order.id }}</span>
        </div>
        <div class="grid gap-4 border-b border-dashed border-white/20 p-6 sm:grid-cols-3 sm:p-8">
          <div><p class="label">Retrait</p><p class="font-semibold first-letter:uppercase">{{ formatPickup(order.pickupAt) }}</p></div>
          <div><p class="label">Lieu</p><p class="font-semibold">{{ restaurant.name }}, {{ restaurant.address.city }}</p></div>
          <div><p class="label">Passée le</p><p class="font-semibold">{{ formatDate(order.createdAt, { dateStyle: 'short', timeStyle: 'short' }) }}</p></div>
        </div>
        <ul class="divide-y divide-white/10 px-6 sm:px-8">
          <li v-for="i in order.items" :key="i.menuItemId" class="flex justify-between gap-4 py-3">
            <span class="min-w-0"><span class="font-bold">{{ i.quantity }}×</span> {{ i.name }}</span>
            <span class="shrink-0 tabular-nums">{{ formatPrice(i.unitPrice * i.quantity) }}</span>
          </li>
        </ul>
        <p v-if="order.note" class="mx-6 mb-4 rounded-lg bg-white/5 px-4 py-3 text-sm text-gray-200 sm:mx-8"><span class="font-semibold">Note :</span> {{ order.note }}</p>
        <div class="space-y-1 bg-gray-700 px-6 py-5 text-sm sm:px-8">
          <div class="flex justify-between text-gray-300"><span>dont TVA (10 %)</span><span class="tabular-nums">{{ formatPrice(order.total - order.total / 1.1) }}</span></div>
          <div class="flex items-baseline justify-between pt-2"><span class="font-bold">Total</span><span class="text-3xl font-bold">{{ formatPrice(order.total) }}</span></div>
          <p class="pt-1 font-semibold" :class="order.isPaid ? 'text-green-300' : 'text-brand'">{{ payment }}</p>
        </div>
      </article>

      <div class="no-print mt-8 flex flex-wrap justify-center gap-3">
        <button class="btn-ghost" onclick="window.print()"><Icon name="receipt" :size="18" /> Imprimer</button>
        <NuxtLink to="/compte/commandes" class="btn-primary">Mes commandes</NuxtLink>
      </div>
    </template>
  </div>
</template>
