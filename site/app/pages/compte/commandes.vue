<script setup lang="ts">
import type { OrderSummary } from '~/types'

definePageMeta({ middleware: 'auth' })
useSeoMeta({ title: 'Mes commandes', robots: 'noindex' })

const api = useApi()
const cart = useCart()
const orders = ref<OrderSummary[] | null>(null)
onMounted(async () => (orders.value = await api<OrderSummary[]>('/orders').catch(() => [])))

async function reorder(o: OrderSummary) {
  for (const i of o.items) {
    await cart.add({ id: i.menuItemId, name: i.name, price: String(i.unitPrice), image_url: null }, i.quantity).catch(() => {})
  }
  cart.open.value = true
}
</script>

<template>
  <div class="container-x max-w-4xl py-12 sm:py-16">
    <NuxtLink to="/compte" class="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink"><Icon name="back" :size="16" /> Mon compte</NuxtLink>
    <h1 class="mt-4 font-display text-5xl font-semibold tracking-tight">Mes commandes</h1>

    <div v-if="orders === null" class="mt-10 space-y-4"><div v-for="i in 3" :key="i" class="skeleton h-32" /></div>
    <div v-else-if="!orders.length" class="card mt-10 p-12 text-center">
      <p class="text-5xl">🧾</p>
      <p class="mt-4 font-display text-2xl">Pas encore de commande</p>
      <NuxtLink to="/carte" class="btn-primary mt-6">Découvrir la carte</NuxtLink>
    </div>
    <ul v-else class="mt-10 space-y-4">
      <li v-for="o in orders" :key="o.id" class="card p-6">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p class="font-display text-2xl font-semibold">Commande #{{ o.id }}</p>
            <p class="text-sm text-muted">{{ formatDate(o.createdAt) }}</p>
          </div>
          <div class="flex items-center gap-3">
            <span class="rounded-full px-3 py-1 text-xs font-bold" :class="o.isPaid ? 'bg-olive/15 text-olive' : 'bg-saffron/20 text-ink'">{{ o.isPaid ? 'Payée' : 'En attente' }}</span>
            <span class="font-display text-2xl font-bold">{{ formatPrice(o.total) }}</span>
          </div>
        </div>
        <p class="mt-4 text-sm text-ink/80">{{ o.items.map((i) => `${i.quantity}× ${i.name}`).join(' · ') }}</p>
        <button class="btn-ghost mt-5 !py-2.5" @click="reorder(o)"><Icon name="plus" :size="16" /> Commander à nouveau</button>
      </li>
    </ul>
  </div>
</template>
