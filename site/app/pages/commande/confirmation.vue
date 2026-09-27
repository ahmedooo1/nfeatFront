<script setup lang="ts">
import type { OrderSummary } from '~/types'

// Retour de la banque après un paiement en ligne avec redirection (3D Secure).
definePageMeta({ middleware: 'auth', alias: ['/order-success'] })
useSeoMeta({ title: 'Confirmation', robots: 'noindex' })

const route = useRoute()
const api = useApi()
const cart = useCart()
const error = ref('')

onMounted(async () => {
  const paymentId = String(route.query.payment_intent ?? '')
  if (!paymentId) return navigateTo('/compte/commandes', { replace: true })
  try {
    const details = JSON.parse(sessionStorage.getItem('nfeat_checkout') || '{}')
    const res = await api<{ order: OrderSummary }>('/orders', {
      method: 'POST',
      body: { pickupAt: 'asap', ...details, paymentMethod: 'card', paymentId },
    })
    sessionStorage.removeItem('nfeat_checkout')
    await cart.refresh()
    await navigateTo({ path: '/commande/suivi', query: { id: res.order.id, new: 1 } }, { replace: true })
  } catch (e) {
    error.value = apiMessage(e, 'Nous n’avons pas pu confirmer la commande. Si vous avez été débité, contactez-nous avec la référence ci-dessous.')
  }
})
</script>

<template>
  <div class="container-x max-w-3xl py-12 sm:py-16">
    <div v-if="error" class="card p-10 text-center">
      <p class="text-2xl">{{ error }}</p>
      <p class="mt-3 text-sm text-gray-300">Référence de paiement : <code class="rounded bg-gray-700 px-2 py-1">{{ route.query.payment_intent }}</code></p>
      <NuxtLink to="/contact" class="btn-primary mt-6">Nous contacter</NuxtLink>
    </div>
    <div v-else class="card p-12 text-center">
      <div class="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-brand/20 border-t-brand" />
      <p class="mt-5 text-2xl">Confirmation de votre commande...</p>
    </div>
  </div>
</template>
