<script setup lang="ts">
import type { OrderSummary } from '~/types'
defineProps<{ orders: OrderSummary[] }>()
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full min-w-[640px] text-left text-sm">
      <thead class="bg-cream/70 text-xs uppercase tracking-wider text-muted">
        <tr><th class="px-6 py-3">N°</th><th class="px-6 py-3">Client</th><th class="px-6 py-3">Contenu</th><th class="px-6 py-3">Date</th><th class="px-6 py-3 text-right">Total</th></tr>
      </thead>
      <tbody class="divide-y divide-ink/5">
        <tr v-for="o in orders" :key="o.id" class="hover:bg-cream/40">
          <td class="px-6 py-4 font-bold">#{{ o.id }}</td>
          <td class="px-6 py-4"><p class="font-semibold">{{ o.customer?.name ?? '—' }}</p><p class="text-xs text-muted">{{ o.customer?.email }}</p></td>
          <td class="max-w-xs px-6 py-4 text-muted"><p class="truncate">{{ o.items.map((i) => `${i.quantity}× ${i.name}`).join(', ') }}</p></td>
          <td class="whitespace-nowrap px-6 py-4 text-muted">{{ formatDate(o.createdAt, { dateStyle: 'short', timeStyle: 'short' }) }}</td>
          <td class="px-6 py-4 text-right font-display text-lg font-bold">{{ formatPrice(o.total) }}</td>
        </tr>
        <tr v-if="!orders.length"><td colspan="5" class="px-6 py-10 text-center text-muted">Aucune commande pour le moment.</td></tr>
      </tbody>
    </table>
  </div>
</template>
