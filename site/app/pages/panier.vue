<script setup lang="ts">
definePageMeta({ alias: ['/Cart', '/cart'] })
useSeoMeta({ title: 'Panier', robots: 'noindex' })
const cart = useCart()
const { loggedIn, loginOpen } = useAuth()
onMounted(() => cart.refresh())

function checkout() {
  if (!loggedIn.value) {
    useState('auth:redirect').value = '/commande'
    loginOpen.value = true
    return
  }
  navigateTo('/commande')
}
</script>

<template>
  <div class="container-x py-12 sm:py-16">
    <h1 class="text-3xl font-bold sm:text-4xl">Panier</h1>
    <div v-if="!cart.lines.value.length" class="card mt-10 flex flex-col items-center gap-4 p-14 text-center">
      <p class="text-2xl">Votre panier est vide</p>
      <NuxtLink to="/carte" class="btn-primary">Voir la carte</NuxtLink>
    </div>
    <div v-else class="mt-10 grid gap-8 lg:grid-cols-3">
      <ul class="card divide-y divide-white/10 lg:col-span-2">
        <li v-for="line in cart.lines.value" :key="line.menuItemId" class="flex items-center gap-5 p-5">
          <div class="h-24 w-24 shrink-0 overflow-hidden rounded-lg"><DishImage :src="line.image_url" :alt="line.name" /></div>
          <div class="min-w-0 flex-1">
            <NuxtLink :to="`/carte/${line.menuItemId}`" class="text-xl font-semibold hover:text-brand">{{ line.name }}</NuxtLink>
            <p class="text-sm text-gray-300">{{ formatPrice(line.price) }} l’unité</p>
            <div class="mt-3 flex items-center gap-4">
              <QuantityStepper :model-value="line.quantity" size="sm" @update:model-value="cart.setQuantity(line.menuItemId, $event)" />
              <button class="text-sm font-semibold text-gray-300 hover:text-brand" @click="cart.remove(line.menuItemId)">Retirer</button>
            </div>
          </div>
          <span class="text-xl font-bold tabular-nums">{{ formatPrice(Number(line.price) * line.quantity) }}</span>
        </li>
      </ul>
      <aside class="card h-fit p-6 lg:sticky lg:top-28">
        <h2 class="text-2xl font-semibold">Récapitulatif</h2>
        <dl class="mt-5 space-y-2 text-sm">
          <div class="flex justify-between"><dt class="text-gray-300">Sous-total HT</dt><dd class="tabular-nums">{{ formatPrice(cart.total.value / 1.1) }}</dd></div>
          <div class="flex justify-between"><dt class="text-gray-300">TVA (10 %)</dt><dd class="tabular-nums">{{ formatPrice(cart.total.value - cart.total.value / 1.1) }}</dd></div>
          <div class="flex justify-between border-t border-white/10 pt-3 text-base font-bold"><dt>Total TTC</dt><dd class="text-2xl tabular-nums">{{ formatPrice(cart.total.value) }}</dd></div>
        </dl>
        <button class="btn-primary mt-6 w-full !py-4" @click="checkout"><Icon name="lock" :size="18" /> Passer au paiement</button>
        <button class="mt-3 w-full text-sm font-semibold text-gray-300 hover:text-brand" @click="cart.clear()">Vider le panier</button>
      </aside>
    </div>
  </div>
</template>
