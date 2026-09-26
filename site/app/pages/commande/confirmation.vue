<script setup lang="ts">
import { restaurant } from '~/restaurant.config'
import type { CartLine } from '~/types'

definePageMeta({ middleware: 'auth', alias: ['/order-success'] })
useSeoMeta({ title: 'Commande confirmée', robots: 'noindex' })

type Receipt = { orderIds: number[]; total: number; paymentId: string; lines: CartLine[]; at: string }
const KEY = 'nfeat_last_order'

const route = useRoute()
const api = useApi()
const cart = useCart()
const { user } = useAuth()
const receipt = ref<Receipt | null>(null)
const error = ref('')
const loading = ref(true)

onMounted(async () => {
  const paymentId = String(route.query.payment_intent ?? '')
  const saved = sessionStorage.getItem(KEY)
  if (saved && (!paymentId || JSON.parse(saved).paymentId === paymentId)) {
    receipt.value = JSON.parse(saved)
    loading.value = false
    return
  }
  if (!paymentId) {
    loading.value = false
    return
  }
  try {
    await cart.refresh()
    const lines = [...cart.lines.value]
    // Le serveur vérifie auprès de Stripe que ce paiement couvre bien ce panier.
    const res = await api<{ orderIds: number[]; total: number }>('/orders', { method: 'POST', body: { paymentId } })
    receipt.value = { ...res, paymentId, lines, at: new Date().toISOString() }
    sessionStorage.setItem(KEY, JSON.stringify(receipt.value))
    await cart.refresh()
  } catch (e) {
    error.value = apiMessage(e, 'Nous n’avons pas pu confirmer la commande. Si vous avez été débité, contactez-nous avec la référence ci-dessous.')
  } finally {
    loading.value = false
  }
})

const reference = computed(() => (receipt.value ? `#${receipt.value.orderIds.join('-')}` : ''))
const readyAt = computed(() => {
  if (!receipt.value) return ''
  const t = new Date(new Date(receipt.value.at).getTime() + restaurant.pickupMinutes * 60_000)
  return formatDate(t.toISOString(), { timeStyle: 'short' })
})
</script>

<template>
  <div class="container-x max-w-3xl py-12 sm:py-16">
    <div v-if="loading" class="card p-12 text-center">
      <div class="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-ember/20 border-t-ember" />
      <p class="mt-5 font-display text-2xl">Confirmation de votre commande…</p>
    </div>

    <div v-else-if="error" class="card p-10 text-center">
      <p class="text-5xl">⚠️</p>
      <p class="mt-4 font-display text-2xl">{{ error }}</p>
      <p class="mt-3 text-sm text-muted">Référence de paiement : <code class="rounded bg-cream px-2 py-1">{{ route.query.payment_intent }}</code></p>
      <NuxtLink to="/contact" class="btn-dark mt-6">Nous contacter</NuxtLink>
    </div>

    <template v-else-if="receipt">
      <div class="no-print text-center">
        <span class="mx-auto grid h-20 w-20 place-items-center rounded-full bg-olive text-white shadow-xl"><Icon name="check" :size="38" :stroke="2.6" /></span>
        <h1 class="mt-6 font-display text-5xl font-semibold tracking-tight">Merci {{ user?.name?.split(' ')[0] }} !</h1>
        <p class="mt-3 text-lg text-muted">Votre commande est confirmée et part en cuisine.</p>
      </div>

      <!-- Ticket imprimable -->
      <article class="card relative mt-10 overflow-hidden">
        <div class="bg-ink px-8 py-6 text-cream">
          <div class="flex items-center justify-between">
            <BrandMark light />
            <span class="rounded-full bg-saffron px-4 py-1.5 font-display text-lg font-bold text-ink">{{ reference }}</span>
          </div>
        </div>
        <div class="grid gap-6 border-b border-dashed border-ink/15 p-8 sm:grid-cols-3">
          <div><p class="label">Prête vers</p><p class="font-display text-3xl font-bold text-ember">{{ readyAt }}</p></div>
          <div><p class="label">Retrait</p><p class="font-semibold">{{ restaurant.address.city }}</p></div>
          <div><p class="label">Passée le</p><p class="font-semibold">{{ formatDate(receipt.at) }}</p></div>
        </div>
        <ul class="divide-y divide-ink/5 px-8">
          <li v-for="l in receipt.lines" :key="l.menuItemId" class="flex justify-between gap-4 py-3">
            <span><span class="font-bold">{{ l.quantity }}×</span> {{ l.name }}</span>
            <span class="tabular-nums">{{ formatPrice(Number(l.price) * l.quantity) }}</span>
          </li>
        </ul>
        <div class="space-y-1 bg-cream/60 px-8 py-6 text-sm">
          <div class="flex justify-between text-muted"><span>dont TVA (10 %)</span><span class="tabular-nums">{{ formatPrice(receipt.total - receipt.total / 1.1) }}</span></div>
          <div class="flex items-baseline justify-between pt-2"><span class="font-bold">Total payé</span><span class="font-display text-3xl font-bold">{{ formatPrice(receipt.total) }}</span></div>
          <p class="pt-2 text-xs text-muted">Paiement {{ receipt.paymentId }}</p>
        </div>
      </article>

      <div class="no-print mt-8 flex flex-wrap justify-center gap-3">
        <button class="btn-ghost" onclick="window.print()"><Icon name="receipt" :size="18" /> Imprimer le reçu</button>
        <NuxtLink to="/compte/commandes" class="btn-dark">Mes commandes</NuxtLink>
        <NuxtLink to="/carte" class="btn-primary">Commander autre chose</NuxtLink>
      </div>
    </template>

    <div v-else class="card p-12 text-center">
      <p class="font-display text-2xl">Aucune commande récente.</p>
      <NuxtLink to="/carte" class="btn-primary mt-6">Voir la carte</NuxtLink>
    </div>
  </div>
</template>
