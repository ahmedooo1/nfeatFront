<script setup lang="ts">
import { loadStripe, type Stripe, type StripeElements } from '@stripe/stripe-js'
import { restaurant } from '~/restaurant.config'
import type { OrderSummary, PaymentMethod, RestaurantStatus } from '~/types'

definePageMeta({ middleware: 'auth' })
useSeoMeta({ title: 'Finaliser la commande', robots: 'noindex' })

const { public: config } = useRuntimeConfig()
const api = useApi()
const cart = useCart()
const { user } = useAuth()

const info = ref<RestaurantStatus | null>(null)
const state = ref<'loading' | 'ready' | 'sending' | 'empty' | 'closed' | 'error'>('loading')
const error = ref('')

const when = ref<'asap' | 'later'>('asap')
const slot = ref('')
const phone = ref('')
const note = ref('')
const method = ref<PaymentMethod>('onsite')

async function loadInfo() {
  info.value = await api<RestaurantStatus>('/restaurant')
  if (!info.value.slots.length) {
    state.value = 'closed'
    return
  }
  if (!info.value.slots.includes(slot.value)) slot.value = info.value.slots[1] ?? info.value.slots[0]!
}

onMounted(async () => {
  phone.value = localStorage.getItem('nfeat_phone') ?? ''
  try {
    await cart.refresh()
    if (!cart.lines.value.length) {
      state.value = 'empty'
      return
    }
    await loadInfo()
    if (state.value === 'loading') state.value = 'ready'
  } catch (e) {
    error.value = apiMessage(e, 'La commande en ligne est momentanément indisponible. Réessayez dans un instant.')
    state.value = 'error'
  }
})

const firstSlot = computed(() => info.value?.slots[0] ?? '')
const asapLabel = computed(() => {
  if (!firstSlot.value) return ''
  return formatDay(firstSlot.value) === 'aujourd’hui' ? `Prête vers ${formatTime(firstSlot.value)}` : `Prête ${formatPickup(firstSlot.value)}`
})
const slotsByDay = computed(() => {
  const groups = new Map<string, string[]>()
  for (const s of info.value?.slots ?? []) {
    const day = formatDay(s)
    groups.set(day, [...(groups.get(day) ?? []), s])
  }
  return [...groups.entries()]
})
const unavailable = computed(() => cart.lines.value.filter((l) => l.available === false))
const phoneValid = computed(() => /^\+?[0-9 .()-]{8,20}$/.test(phone.value.trim()) && (phone.value.match(/\d/g)?.length ?? 0) >= 8)

// Paiement en ligne : le formulaire Stripe n'est chargé que si le client le choisit.
const mountEl = ref<HTMLElement>()
const stripeReady = ref(false)
const amount = ref(0)
let stripe: Stripe | null = null
let elements: StripeElements | null = null

watch(method, async (m) => {
  if (m !== 'card' || elements) return
  try {
    const intent = await api<{ clientSecret: string; amount: number }>('/payment', { method: 'POST' })
    amount.value = intent.amount
    stripe = await loadStripe(config.stripeKey)
    if (!stripe) throw new Error('Stripe indisponible')
    elements = stripe.elements({
      clientSecret: intent.clientSecret,
      locale: 'fr',
      appearance: { theme: 'night', variables: { colorPrimary: '#eab308', colorBackground: '#4b5563', borderRadius: '8px' } },
    })
    await nextTick()
    elements.create('payment', { layout: 'tabs', defaultValues: { billingDetails: { name: user.value?.name ?? '', email: user.value?.email ?? '' } } }).mount(mountEl.value!)
    stripeReady.value = true
  } catch (e) {
    error.value = apiMessage(e, 'Le paiement en ligne n’a pas pu être chargé. Vous pouvez payer au retrait.')
    method.value = 'onsite'
  }
})

const details = () => ({ pickupAt: when.value === 'asap' ? 'asap' : slot.value, phone: phone.value.trim(), note: note.value.trim() })

async function place(paymentId?: string) {
  const res = await api<{ order: OrderSummary }>('/orders', {
    method: 'POST',
    body: { ...details(), paymentMethod: paymentId ? 'card' : 'onsite', ...(paymentId ? { paymentId } : {}) },
  })
  await cart.refresh()
  await navigateTo({ path: '/commande/suivi', query: { id: res.order.id, new: 1 } }, { replace: true })
}

async function submit() {
  error.value = ''
  if (!phoneValid.value) {
    error.value = 'Indiquez un numéro de téléphone valide, le restaurant pourra vous joindre si besoin.'
    return
  }
  state.value = 'sending'
  localStorage.setItem('nfeat_phone', phone.value.trim())
  try {
    if (method.value === 'onsite') {
      await place()
      return
    }
    if (!stripe || !elements) throw new Error('Le paiement en ligne n’est pas prêt.')
    // Conservé en cas de redirection par la banque (3D Secure).
    sessionStorage.setItem('nfeat_checkout', JSON.stringify(details()))
    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/commande/confirmation` },
      redirect: 'if_required',
    })
    if (stripeError) throw new Error(stripeError.message ?? 'Paiement refusé.')
    if (paymentIntent?.status !== 'succeeded') throw new Error('Le paiement est en cours de validation. Vous recevrez une confirmation.')
    await place(paymentIntent.id)
  } catch (e) {
    error.value = apiMessage(e, e instanceof Error ? e.message : 'La commande n’a pas pu être envoyée.')
    // Créneau expiré entre-temps, plat devenu indisponible : on remet à jour.
    await loadInfo().catch(() => {})
    await cart.refresh().catch(() => {})
    if (state.value === 'sending') state.value = 'ready'
  }
}

const total = computed(() => cart.total.value)
</script>

<template>
  <div class="container-x py-12 sm:py-16">
    <NuxtLink to="/panier" class="inline-flex items-center gap-2 text-sm font-semibold text-gray-300 hover:text-white"><Icon name="back" :size="16" /> Modifier le panier</NuxtLink>
    <h1 class="mt-4 text-3xl font-bold sm:text-4xl">Finaliser la commande</h1>

    <div v-if="state === 'loading'" class="mt-10 grid gap-8 lg:grid-cols-5"><div class="skeleton h-96 lg:col-span-3" /><div class="skeleton h-64 lg:col-span-2" /></div>

    <div v-else-if="state === 'empty'" class="card mt-10 p-12 text-center">
      <p class="text-2xl">Votre panier est vide.</p>
      <NuxtLink to="/carte" class="btn-primary mt-6">Voir le menu</NuxtLink>
    </div>

    <div v-else-if="state === 'closed' || state === 'error'" class="card mt-10 p-12 text-center">
      <Icon name="clock" :size="40" class="mx-auto text-brand" />
      <p class="mt-4 text-2xl">{{ state === 'closed' ? 'Les commandes en ligne sont fermées pour le moment.' : error }}</p>
      <p class="mt-2 text-gray-300">Votre panier est conservé.</p>
      <NuxtLink to="/contact" class="btn-ghost mt-6">Horaires et contact</NuxtLink>
    </div>

    <form v-else class="mt-10 grid gap-8 lg:grid-cols-5" @submit.prevent="submit">
      <div class="min-w-0 space-y-6 lg:col-span-3">
        <section class="card p-6 sm:p-8">
          <h2 class="flex items-center gap-2 text-2xl font-semibold"><Icon name="store" :size="22" class="text-brand" /> Retrait au restaurant</h2>
          <p v-if="info && !info.openNow" class="mt-2 text-sm text-gray-300">Le restaurant est fermé en ce moment, votre commande sera préparée à la réouverture.</p>
          <div class="mt-5 grid gap-3 sm:grid-cols-2">
            <label class="choice" :class="{ 'choice-on': when === 'asap' }">
              <input v-model="when" type="radio" value="asap" class="sr-only">
              <span class="font-semibold">{{ info?.openNow ? 'Dès que possible' : 'Au plus tôt' }}</span>
              <span class="text-sm text-gray-300">{{ asapLabel }}</span>
            </label>
            <label class="choice" :class="{ 'choice-on': when === 'later' }">
              <input v-model="when" type="radio" value="later" class="sr-only">
              <span class="font-semibold">Choisir une heure</span>
              <span class="text-sm text-gray-300">{{ when === 'later' && slot ? formatPickup(slot) : 'Plus tard dans la journée' }}</span>
            </label>
          </div>
          <div v-if="when === 'later'" class="mt-4">
            <label class="label" for="slot">Heure de retrait</label>
            <select id="slot" v-model="slot" class="field">
              <optgroup v-for="[day, list] in slotsByDay" :key="day" :label="day.charAt(0).toUpperCase() + day.slice(1)">
                <option v-for="s in list" :key="s" :value="s">{{ formatTime(s) }}</option>
              </optgroup>
            </select>
          </div>
          <p v-if="restaurant.address.street || restaurant.address.city" class="mt-4 flex items-center gap-2 text-sm text-gray-300">
            <Icon name="pin" :size="16" /> {{ [restaurant.address.street, `${restaurant.address.postalCode} ${restaurant.address.city}`].filter(Boolean).join(', ') }}
          </p>
        </section>

        <section class="card p-6 sm:p-8">
          <h2 class="flex items-center gap-2 text-2xl font-semibold"><Icon name="user" :size="22" class="text-brand" /> Vos coordonnées</h2>
          <div class="mt-5 grid gap-4 sm:grid-cols-2">
            <div class="min-w-0">
              <p class="label">Nom</p>
              <p class="truncate py-3 font-semibold">{{ user?.name || user?.email }}</p>
            </div>
            <div>
              <label class="label" for="phone">Téléphone</label>
              <input id="phone" v-model="phone" type="tel" autocomplete="tel" class="field" placeholder="06 12 34 56 78" required>
            </div>
          </div>
          <div class="mt-4">
            <label class="label" for="note">Note pour la cuisine <span class="font-normal text-gray-400">(facultatif)</span></label>
            <textarea id="note" v-model="note" class="field min-h-20" maxlength="500" placeholder="Allergies, sans oignon, couverts..." />
          </div>
        </section>

        <section class="card p-6 sm:p-8">
          <h2 class="flex items-center gap-2 text-2xl font-semibold"><Icon name="card" :size="22" class="text-brand" /> Paiement</h2>
          <div class="mt-5 grid gap-3" :class="info?.payment.online ? 'sm:grid-cols-2' : ''">
            <label class="choice" :class="{ 'choice-on': method === 'onsite' }">
              <input v-model="method" type="radio" value="onsite" class="sr-only">
              <span class="font-semibold">Payer au retrait</span>
              <span class="text-sm text-gray-300">Espèces ou carte au comptoir</span>
            </label>
            <label v-if="info?.payment.online" class="choice" :class="{ 'choice-on': method === 'card' }">
              <input v-model="method" type="radio" value="card" class="sr-only">
              <span class="font-semibold">Payer en ligne</span>
              <span class="text-sm text-gray-300">Carte bancaire, Apple Pay, Google Pay</span>
            </label>
          </div>
          <div v-if="method === 'card'" class="mt-5">
            <div v-if="!stripeReady" class="space-y-3"><div class="skeleton h-12" /><div class="skeleton h-12" /></div>
            <div ref="mountEl" />
            <p class="mt-3 flex items-center gap-2 text-xs text-gray-300"><Icon name="lock" :size="14" /> Paiement sécurisé par Stripe, vos données bancaires ne passent pas par notre site.</p>
          </div>
        </section>
      </div>

      <aside class="card h-fit min-w-0 p-6 lg:sticky lg:top-28 lg:col-span-2">
        <h2 class="text-2xl font-semibold">Votre commande</h2>
        <ul class="mt-4 divide-y divide-white/10">
          <li v-for="l in cart.lines.value" :key="l.menuItemId" class="flex justify-between gap-4 py-3 text-sm" :class="{ 'text-red-300': l.available === false }">
            <span class="min-w-0"><span class="font-bold">{{ l.quantity }}×</span> {{ l.name }}<span v-if="l.available === false" class="block text-xs">Indisponible</span></span>
            <span class="shrink-0 tabular-nums">{{ formatPrice(Number(l.price) * l.quantity) }}</span>
          </li>
        </ul>
        <div class="mt-3 flex items-baseline justify-between border-t border-white/10 pt-4">
          <span class="font-bold">Total</span>
          <span class="text-3xl font-bold">{{ formatPrice(total) }}</span>
        </div>
        <p class="mt-1 text-right text-xs text-gray-400">TVA incluse</p>

        <p v-if="unavailable.length" class="mt-5 rounded-lg bg-red-500/20 px-4 py-3 text-sm text-red-200">
          Plus disponible : {{ unavailable.map((l) => l.name).join(', ') }}. <NuxtLink to="/panier" class="font-semibold underline">Modifier le panier</NuxtLink>
        </p>
        <p v-if="error" class="mt-5 rounded-lg bg-red-500/20 px-4 py-3 text-sm text-red-200" role="alert">{{ error }}</p>

        <button class="btn-primary mt-6 w-full !py-4 text-base" :disabled="state === 'sending' || !!unavailable.length || (method === 'card' && !stripeReady)">
          <template v-if="state === 'sending'">Envoi en cours...</template>
          <template v-else-if="method === 'card'">Payer {{ formatPrice(amount || total) }}</template>
          <template v-else>Valider la commande</template>
        </button>
        <p class="mt-3 text-center text-xs text-gray-400">
          {{ method === 'card' ? 'Vous êtes débité maintenant.' : `À régler au retrait : ${formatPrice(total)}` }}
        </p>
      </aside>
    </form>
  </div>
</template>

<style scoped>
.choice {
  display: flex;
  cursor: pointer;
  flex-direction: column;
  gap: 0.15rem;
  border-radius: 0.5rem;
  border: 2px solid rgb(255 255 255 / 0.1);
  background: var(--color-tile);
  padding: 0.9rem 1rem;
  transition: border-color 0.15s;
}
.choice:hover { border-color: rgb(255 255 255 / 0.3); }
.choice-on, .choice-on:hover { border-color: var(--color-brand); }
.choice:has(:focus-visible) { outline: 2px solid var(--color-brand); outline-offset: 2px; }
</style>
