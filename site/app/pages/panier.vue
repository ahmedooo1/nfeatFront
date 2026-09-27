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
      <ul class="card min-w-0 divide-y divide-white/10 lg:col-span-2">
        <li v-for="line in cart.lines.value" :key="line.menuItemId" class="flex gap-4 p-4 sm:p-5">
          <div class="h-20 w-20 shrink-0 overflow-hidden rounded-lg sm:h-24 sm:w-24"><DishImage :src="line.image_url" :alt="line.name" /></div>
          <div class="min-w-0 flex-1">
            <div class="flex items-start justify-between gap-3">
              <NuxtLink :to="`/carte/${line.menuItemId}`" class="truncate text-lg font-semibold hover:text-brand sm:text-xl">{{ line.name }}</NuxtLink>
              <span class="shrink-0 text-lg font-bold tabular-nums">{{ formatPrice(Number(line.price) * line.quantity) }}</span>
            </div>
            <p v-if="line.available === false" class="text-sm font-semibold text-red-300">Plus disponible, retirez-le pour commander</p>
            <p v-else class="text-sm text-gray-300">{{ formatPrice(line.price) }} l’unité</p>
            <div class="mt-3 flex flex-wrap items-center gap-3">
              <QuantityStepper :model-value="line.quantity" @update:model-value="cart.setQuantity(line.menuItemId, $event)" />
              <button class="text-sm font-semibold text-gray-300 hover:text-brand" @click="cart.remove(line.menuItemId)">Retirer</button>
            </div>
          </div>
        </li>
      </ul>
      <aside class="card h-fit min-w-0 p-6 lg:sticky lg:top-28">
        <h2 class="text-2xl font-semibold">Récapitulatif</h2>
        <dl class="mt-5 space-y-2 text-sm">
          <div class="flex justify-between"><dt class="text-gray-300">{{ cart.count.value }} article{{ cart.count.value > 1 ? 's' : '' }}</dt><dd class="tabular-nums">{{ formatPrice(cart.total.value) }}</dd></div>
          <div class="flex justify-between border-t border-white/10 pt-3 text-base font-bold"><dt>Total</dt><dd class="text-2xl tabular-nums">{{ formatPrice(cart.total.value) }}</dd></div>
        </dl>
        <p class="mt-1 text-right text-xs text-gray-400">TVA incluse</p>
        <p class="mt-4 flex items-center gap-2 text-sm text-gray-300"><Icon name="store" :size="16" class="shrink-0 text-brand" /> À récupérer au restaurant</p>
        <button class="btn-primary mt-6 w-full !py-4" :disabled="cart.hasUnavailable.value" @click="checkout">Commander</button>
        <button class="mt-3 w-full text-sm font-semibold text-gray-300 hover:text-brand" @click="cart.clear()">Vider le panier</button>
      </aside>
    </div>
  </div>
</template>
