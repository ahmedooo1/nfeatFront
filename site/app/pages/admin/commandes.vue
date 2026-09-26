<script setup lang="ts">
import type { OrderSummary } from '~/types'
definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Commandes', robots: 'noindex' })

const api = useApi()
const page = ref(1)
const limit = 20
const data = ref<{ data: OrderSummary[]; total: number } | null>(null)
const pages = computed(() => Math.max(1, Math.ceil((data.value?.total ?? 0) / limit)))
watchEffect(async () => {
  data.value = await api<{ data: OrderSummary[]; total: number }>('/admin/orders', { query: { page: page.value, limit } }).catch(() => ({ data: [], total: 0 }))
})
</script>

<template>
  <div>
    <h1 class="font-display text-4xl font-semibold tracking-tight">Commandes</h1>
    <p class="mt-1 text-muted">{{ data?.total ?? 0 }} commande(s) au total</p>
    <section class="card mt-8 overflow-hidden">
      <AdminOrdersTable :orders="data?.data ?? []" />
      <div class="flex items-center justify-between border-t border-ink/5 px-6 py-4 text-sm">
        <button class="btn-ghost !py-2" :disabled="page <= 1" @click="page--">Précédent</button>
        <span class="text-muted">Page {{ page }} / {{ pages }}</span>
        <button class="btn-ghost !py-2" :disabled="page >= pages" @click="page++">Suivant</button>
      </div>
    </section>
  </div>
</template>
