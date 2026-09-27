<script setup lang="ts">
import type { OrderSummary } from '~/types'
defineProps<{ orders: OrderSummary[] }>()
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full min-w-[760px] text-left text-sm">
      <thead class="bg-gray-700 text-xs uppercase tracking-wider text-gray-300">
        <tr><th class="px-6 py-3">N°</th><th class="px-6 py-3">Client</th><th class="px-6 py-3">Contenu</th><th class="px-6 py-3">Retrait</th><th class="px-6 py-3">Statut</th><th class="px-6 py-3 text-right">Total</th></tr>
      </thead>
      <tbody class="divide-y divide-white/10">
        <tr v-for="o in orders" :key="o.id" class="hover:bg-white/5">
          <td class="px-6 py-4 font-bold">#{{ o.id }}</td>
          <td class="px-6 py-4"><p class="font-semibold">{{ o.customer?.name ?? '-' }}</p><p class="text-xs text-gray-300">{{ o.customer?.phone || o.customer?.email }}</p></td>
          <td class="max-w-xs px-6 py-4 text-gray-300"><p class="truncate">{{ o.items.map((i) => `${i.quantity}× ${i.name}`).join(', ') }}</p></td>
          <td class="whitespace-nowrap px-6 py-4 text-gray-300">{{ formatDate(o.pickupAt ?? o.createdAt, { dateStyle: 'short', timeStyle: 'short' }) }}</td>
          <td class="px-6 py-4"><span class="whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold" :class="orderStatus[o.status]?.tone">{{ orderStatus[o.status]?.label }}</span></td>
          <td class="px-6 py-4 text-right">
            <p class="text-lg font-bold">{{ formatPrice(o.total) }}</p>
            <p class="text-xs" :class="o.isPaid ? 'text-green-300' : 'text-brand'">{{ o.isPaid ? (o.paymentMethod === 'card' ? 'En ligne' : 'Encaissée') : 'À encaisser' }}</p>
          </td>
        </tr>
        <tr v-if="!orders.length"><td colspan="6" class="px-6 py-10 text-center text-gray-300">Aucune commande pour le moment.</td></tr>
      </tbody>
    </table>
  </div>
</template>
