<script setup lang="ts">
import { loadStripe, type Stripe, type StripeElements } from '@stripe/stripe-js'
import { restaurant } from '~/restaurant.config'

definePageMeta({ middleware: 'auth' })
useSeoMeta({ title: 'Paiement', robots: 'noindex' })

const { public: config } = useRuntimeConfig()
const api = useApi()
const cart = useCart()
const { user } = useAuth()

const state = ref<'loading' | 'ready' | 'paying' | 'error' | 'empty'>('loading')
const error = ref('')
const amount = ref(0)
const mountEl = ref<HTMLElement>()
let stripe: Stripe | null = null
let elements: StripeElements | null = null

onMounted(async () => {
  await cart.refresh()
  if (!cart.lines.value.length) {
    state.value = 'empty'
    return
  }
  try {
    // Le montant est calculé par le serveur à partir des prix de la carte.
    const intent = await api<{ clientSecret: string; amount: number }>('/payment', { method: 'POST' })
    amount.value = intent.amount
    stripe = await loadStripe(config.stripeKey)
    if (!stripe) throw new Error('Stripe indisponible')
    elements = stripe.elements({
      clientSecret: intent.clientSecret,
      locale: 'fr',
      appearance: {
        theme: 'stripe',
        variables: { colorPrimary: '#e0512a', colorText: '#16110d', colorBackground: '#ffffff', borderRadius: '14px', fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif', spacingUnit: '4px' },
      },
    })
    elements.create('payment', { layout: 'tabs', defaultValues: { billingDetails: { name: user.value?.name ?? '', email: user.value?.email ?? '' } } }).mount(mountEl.value!)
    state.value = 'ready'
  } catch (e) {
    error.value = apiMessage(e, 'Le paiement n’a pas pu être initialisé. Réessayez dans un instant.')
    state.value = 'error'
  }
})

async function pay() {
  if (!stripe || !elements) return
  state.value = 'paying'
  error.value = ''
  const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
    elements,
    confirmParams: { return_url: `${window.location.origin}/commande/confirmation` },
    redirect: 'if_required',
  })
  if (stripeError) {
    error.value = stripeError.message ?? 'Paiement refusé.'
    state.value = 'ready'
    return
  }
  if (paymentIntent?.status === 'succeeded') {
    await navigateTo({ path: '/commande/confirmation', query: { payment_intent: paymentIntent.id } })
  } else {
    error.value = 'Le paiement est en cours de validation. Vous recevrez une confirmation.'
    state.value = 'ready'
  }
}
</script>

<template>
  <div class="container-x py-12 sm:py-16">
    <NuxtLink to="/panier" class="inline-flex items-center gap-2 text-sm font-semibold text-gray-300 hover:text-white"><Icon name="back" :size="16" /> Modifier le panier</NuxtLink>
    <h1 class="mt-4 text-3xl font-bold sm:text-4xl">Paiement</h1>

    <div v-if="state === 'empty'" class="card mt-10 p-12 text-center">
      <p class="text-2xl">Votre panier est vide.</p>
      <NuxtLink to="/carte" class="btn-primary mt-6">Voir la carte</NuxtLink>
    </div>

    <div v-else class="mt-10 grid gap-8 lg:grid-cols-5">
      <section class="card p-6 sm:p-8 lg:col-span-3">
        <h2 class="flex items-center gap-2 text-2xl font-semibold"><Icon name="lock" :size="20" class="text-green-400" /> Paiement sécurisé</h2>
        <p class="mt-1 text-sm text-gray-300">Carte bancaire, Apple Pay ou Google Pay. Vos données sont chiffrées et traitées par Stripe.</p>
        <div v-if="state === 'loading'" class="mt-6 space-y-3"><div class="skeleton h-12" /><div class="skeleton h-12" /><div class="skeleton h-12 w-2/3" /></div>
        <div ref="mountEl" class="mt-6" />
        <p v-if="error" class="mt-5 rounded-lg bg-red-500/20 px-4 py-3 text-sm text-red-200">{{ error }}</p>
        <button v-if="state !== 'error'" class="btn-primary mt-6 w-full !py-4 text-base" :disabled="state !== 'ready'" @click="pay">
          {{ state === 'paying' ? 'Paiement en cours...' : `Payer ${formatPrice(amount)}` }}
        </button>
        <p class="mt-4 text-center text-xs text-gray-300">Mode démonstration : carte de test 4242 4242 4242 4242, date future, CVC au choix.</p>
      </section>

      <aside class="card h-fit p-6 lg:col-span-2">
        <h2 class="text-2xl font-semibold">Votre commande</h2>
        <ul class="mt-4 divide-y divide-white/10">
          <li v-for="l in cart.lines.value" :key="l.menuItemId" class="flex justify-between gap-4 py-3 text-sm">
            <span><span class="font-bold">{{ l.quantity }}×</span> {{ l.name }}</span>
            <span class="tabular-nums">{{ formatPrice(Number(l.price) * l.quantity) }}</span>
          </li>
        </ul>
        <div class="mt-3 flex items-baseline justify-between border-t border-white/10 pt-4">
          <span class="font-bold">Total TTC</span>
          <span class="text-3xl font-bold">{{ formatPrice(amount || cart.total.value) }}</span>
        </div>
        <p class="mt-5 flex items-start gap-2 rounded-lg bg-gray-700 p-4 text-sm text-gray-300"><Icon name="clock" :size="18" class="mt-0.5 shrink-0 text-brand" /> À récupérer au restaurant, prête environ {{ restaurant.pickupMinutes }} minutes après le paiement.</p>
      </aside>
    </div>
  </div>
</template>
