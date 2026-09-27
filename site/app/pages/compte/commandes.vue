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
    <NuxtLink to="/compte" class="inline-flex items-center gap-2 text-sm font-semibold text-gray-300 hover:text-white"><Icon name="back" :size="16" /> Mon compte</NuxtLink>
    <h1 class="mt-4 text-3xl font-bold sm:text-4xl">Mes commandes</h1>

    <div v-if="orders === null" class="mt-10 space-y-4"><div v-for="i in 3" :key="i" class="skeleton h-32" /></div>
    <div v-else-if="!orders.length" class="card mt-10 p-12 text-center">
      <p class="mt-4 text-2xl">Pas encore de commande</p>
      <NuxtLink to="/carte" class="btn-primary mt-6">Découvrir la carte</NuxtLink>
    </div>
    <ul v-else class="mt-10 space-y-4">
      <li v-for="o in orders" :key="o.id" class="card p-6">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p class="text-2xl font-semibold">Commande #{{ o.id }}</p>
            <p class="text-sm text-gray-300 first-letter:uppercase">{{ o.pickupAt ? `Retrait ${formatPickup(o.pickupAt)}` : formatDate(o.createdAt) }}</p>
          </div>
          <div class="flex items-center gap-3">
            <span class="rounded-full px-3 py-1 text-xs font-bold" :class="orderStatus[o.status]?.tone">{{ orderStatus[o.status]?.label }}</span>
            <span class="text-2xl font-bold">{{ formatPrice(o.total) }}</span>
          </div>
        </div>
        <p class="mt-4 text-sm text-gray-100">{{ o.items.map((i) => `${i.quantity}× ${i.name}`).join(', ') }}</p>
        <p v-if="o.paymentMethod === 'onsite' && !o.isPaid && o.status !== 'cancelled'" class="mt-1 text-sm text-brand">À régler au retrait</p>
        <div class="mt-5 flex flex-wrap gap-3">
          <NuxtLink :to="{ path: '/commande/suivi', query: { id: o.id } }" :class="isActiveOrder(o.status) ? 'btn-primary' : 'btn-ghost'" class="!py-2.5">{{ isActiveOrder(o.status) ? 'Suivre la commande' : 'Détails' }}</NuxtLink>
          <button class="btn-ghost !py-2.5" @click="reorder(o)"><Icon name="plus" :size="16" /> Commander à nouveau</button>
        </div>
      </li>
    </ul>
  </div>
</template>
