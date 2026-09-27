<script setup lang="ts">
import type { OrderStatus, OrderSummary } from '~/types'
definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Commandes', robots: 'noindex' })

const api = useApi()
const toast = useToast()
const tab = ref<'active' | 'all'>('active')

// En cours : commandes à préparer, triées par heure de retrait.
const active = ref<OrderSummary[] | null>(null)
async function loadActive() {
  const res = await api<{ data: OrderSummary[] }>('/admin/orders', { query: { active: 1, limit: 100 } }).catch(() => null)
  if (res) active.value = res.data
}

// Historique paginé.
const page = ref(1)
const limit = 20
const history = ref<{ data: OrderSummary[]; total: number } | null>(null)
const pages = computed(() => Math.max(1, Math.ceil((history.value?.total ?? 0) / limit)))
async function loadHistory() {
  history.value = await api<{ data: OrderSummary[]; total: number }>('/admin/orders', { query: { page: page.value, limit } }).catch(() => ({ data: [], total: 0 }))
}
watch(page, loadHistory)
watch(tab, (t) => (t === 'all' ? loadHistory() : loadActive()))

let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  loadActive()
  timer = setInterval(() => tab.value === 'active' && loadActive(), 30_000)
})
onBeforeUnmount(() => clearInterval(timer))
useOrderStream((o) => {
  toast.success(`Nouvelle commande de ${o.user.name ?? o.user.email}`)
  loadActive()
})

const next: Record<string, { status: OrderStatus; label: string } | undefined> = {
  received: { status: 'preparing', label: 'Lancer la préparation' },
  preparing: { status: 'ready', label: 'Commande prête' },
  ready: { status: 'collected', label: 'Remise au client' },
}
const busy = ref<number | null>(null)

async function update(o: OrderSummary, body: Record<string, unknown>) {
  busy.value = o.id
  try {
    const updated = await api<OrderSummary>(`/admin/orders/${o.id}`, { method: 'PATCH', body })
    Object.assign(o, updated)
    if (!isActiveOrder(o.status) && active.value) active.value = active.value.filter((x) => x.id !== o.id)
  } catch (e) {
    toast.error(apiMessage(e))
  } finally {
    busy.value = null
  }
}
function advance(o: OrderSummary) {
  const step = next[o.status]
  if (!step) return
  if (step.status === 'collected' && o.paymentMethod === 'onsite' && !o.isPaid && !confirm(`Encaisser ${formatPrice(o.total)} et remettre la commande #${o.id} ?`)) return
  update(o, { status: step.status })
}
function cancel(o: OrderSummary) {
  const refund = o.paymentMethod === 'card' ? ' Elle a été payée en ligne : pensez à la rembourser depuis Stripe.' : ''
  if (confirm(`Annuler la commande #${o.id} ?${refund}`)) update(o, { status: 'cancelled' })
}
const late = (o: OrderSummary) => !!o.pickupAt && o.status !== 'ready' && new Date(o.pickupAt).getTime() < Date.now()
</script>

<template>
  <div>
    <div class="flex flex-wrap items-end justify-between gap-4">
      <h1 class="text-4xl font-bold">Commandes</h1>
      <div class="flex rounded-full bg-tile p-1 text-sm font-semibold">
        <button class="rounded-full px-4 py-2" :class="tab === 'active' ? 'bg-brand' : ''" @click="tab = 'active'">En cours<span v-if="active?.length"> ({{ active.length }})</span></button>
        <button class="rounded-full px-4 py-2" :class="tab === 'all' ? 'bg-brand' : ''" @click="tab = 'all'">Historique</button>
      </div>
    </div>

    <template v-if="tab === 'active'">
      <div v-if="active === null" class="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3"><div v-for="i in 3" :key="i" class="skeleton h-64" /></div>
      <p v-else-if="!active.length" class="card mt-8 p-12 text-center text-gray-300">Aucune commande en cours.</p>
      <div v-else class="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <article v-for="o in active" :key="o.id" class="card flex flex-col p-5" :class="{ 'ring-2 ring-red-400': late(o), 'ring-2 ring-green-500': o.status === 'ready' }">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-3xl font-bold">{{ o.pickupAt ? formatTime(o.pickupAt) : '-' }}</p>
              <p class="text-xs text-gray-300 first-letter:uppercase">{{ o.pickupAt ? formatDay(o.pickupAt) : '' }}<span v-if="late(o)" class="font-bold text-red-300">, en retard</span></p>
            </div>
            <div class="text-right">
              <p class="font-bold">#{{ o.id }}</p>
              <span class="mt-1 inline-block rounded-full px-3 py-1 text-xs font-bold" :class="orderStatus[o.status]?.tone">{{ orderStatus[o.status]?.label }}</span>
            </div>
          </div>

          <div class="mt-4 border-t border-white/10 pt-3 text-sm">
            <p class="font-semibold">{{ o.customer?.name || o.customer?.email }}</p>
            <a v-if="o.customer?.phone" :href="`tel:${o.customer.phone.replace(/[^+\d]/g, '')}`" class="inline-flex items-center gap-1 text-brand hover:underline"><Icon name="phone" :size="14" /> {{ o.customer.phone }}</a>
          </div>

          <ul class="mt-3 space-y-1 text-sm">
            <li v-for="i in o.items" :key="i.menuItemId"><span class="font-bold">{{ i.quantity }}×</span> {{ i.name }}</li>
          </ul>
          <p v-if="o.note" class="mt-3 rounded-lg bg-brand/15 px-3 py-2 text-sm text-yellow-100"><span class="font-semibold">Note :</span> {{ o.note }}</p>

          <div class="mt-auto flex items-center justify-between border-t border-white/10 pt-3 text-sm">
            <span class="font-semibold" :class="o.isPaid ? 'text-green-300' : 'text-brand'">{{ o.isPaid ? (o.paymentMethod === 'card' ? 'Payée en ligne' : 'Encaissée') : 'À encaisser' }}</span>
            <span class="text-xl font-bold">{{ formatPrice(o.total) }}</span>
          </div>

          <div class="mt-4 flex gap-2">
            <button v-if="next[o.status]" class="btn-primary flex-1 !py-2.5" :disabled="busy === o.id" @click="advance(o)">{{ next[o.status]!.label }}</button>
            <button class="btn-ghost !px-3 !py-2.5" :disabled="busy === o.id" aria-label="Annuler la commande" title="Annuler" @click="cancel(o)"><Icon name="x" :size="16" /></button>
          </div>
        </article>
      </div>
    </template>

    <section v-else class="card mt-8 overflow-hidden">
      <AdminOrdersTable :orders="history?.data ?? []" />
      <div class="flex items-center justify-between border-t border-white/10 px-6 py-4 text-sm">
        <button class="btn-ghost !py-2" :disabled="page <= 1" @click="page--">Précédent</button>
        <span class="text-gray-300">Page {{ page }} / {{ pages }}</span>
        <button class="btn-ghost !py-2" :disabled="page >= pages" @click="page++">Suivant</button>
      </div>
    </section>
  </div>
</template>
