<script setup lang="ts">
const cart = useCart()
const { loggedIn, loginOpen } = useAuth()
const route = useRoute()

watch(() => route.fullPath, () => (cart.open.value = false))
watch(cart.open, (v) => {
  if (import.meta.client) document.documentElement.style.overflow = v ? 'hidden' : ''
})

function checkout() {
  cart.open.value = false
  if (!loggedIn.value) {
    useState('auth:redirect').value = '/commande'
    loginOpen.value = true
    return
  }
  navigateTo('/commande')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="cart.open.value" class="fixed inset-0 z-50 bg-black/60" @click="cart.open.value = false" />
    </Transition>
    <Transition name="drawer">
      <aside v-if="cart.open.value" class="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-night text-white shadow-2xl" role="dialog" aria-modal="true" aria-label="Votre panier">
        <header class="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 class="text-2xl font-bold">Votre panier</h2>
          <button class="rounded-full p-2 hover:bg-white/10" aria-label="Fermer" @click="cart.open.value = false"><Icon name="x" /></button>
        </header>

        <div v-if="!cart.lines.value.length" class="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
          <img src="/images/logo.png" alt="" class="w-24 opacity-60">
          <p class="text-lg">Votre panier est vide.</p>
          <NuxtLink to="/carte" class="btn-primary">Voir le menu</NuxtLink>
        </div>

        <ul v-else class="flex-1 space-y-3 overflow-y-auto p-4">
          <li v-for="line in cart.lines.value" :key="line.menuItemId" class="flex gap-3 rounded-lg bg-tile p-3">
            <div class="h-20 w-20 shrink-0 overflow-hidden rounded-md"><DishImage :src="line.image_url" :alt="line.name" /></div>
            <div class="flex min-w-0 flex-1 flex-col">
              <div class="flex items-start justify-between gap-2">
                <p class="truncate font-semibold">{{ line.name }}</p>
                <button class="text-gray-300 hover:text-red-400" :aria-label="`Retirer ${line.name}`" @click="cart.remove(line.menuItemId)"><Icon name="trash" :size="16" /></button>
              </div>
              <p class="text-sm text-gray-300">{{ formatPrice(line.price) }}</p>
              <div class="mt-auto flex items-center justify-between">
                <QuantityStepper :model-value="line.quantity" @update:model-value="cart.setQuantity(line.menuItemId, $event)" />
                <span class="font-bold tabular-nums">{{ formatPrice(Number(line.price) * line.quantity) }}</span>
              </div>
            </div>
          </li>
        </ul>

        <footer v-if="cart.lines.value.length" class="border-t border-white/10 p-5">
          <div class="flex items-baseline justify-between">
            <span class="text-gray-300">Total TTC</span>
            <span class="text-2xl font-bold">{{ formatPrice(cart.total.value) }}</span>
          </div>
          <button class="btn-primary mt-4 w-full !py-3" @click="checkout"><Icon name="lock" :size="18" /> Passer au paiement</button>
          <NuxtLink to="/panier" class="mt-3 block text-center text-sm text-gray-300 underline hover:text-white">Voir le panier en détail</NuxtLink>
        </footer>
      </aside>
    </Transition>
  </Teleport>
</template>
