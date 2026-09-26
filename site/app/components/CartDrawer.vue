<script setup lang="ts">
import { restaurant } from '~/restaurant.config'
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
    loginOpen.value = true
    useState('auth:redirect').value = '/commande'
    return
  }
  navigateTo('/commande')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="cart.open.value" class="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm" @click="cart.open.value = false" />
    </Transition>
    <Transition name="drawer">
      <aside v-if="cart.open.value" class="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-cream shadow-2xl" role="dialog" aria-modal="true" aria-label="Votre panier">
        <header class="flex items-center justify-between border-b border-ink/10 px-6 py-5">
          <div>
            <h2 class="font-display text-2xl font-semibold">Votre panier</h2>
            <p class="text-sm text-muted">{{ cart.count.value }} article{{ cart.count.value > 1 ? 's' : '' }} · prêt en ~{{ restaurant.pickupMinutes }} min</p>
          </div>
          <button class="grid h-10 w-10 place-items-center rounded-full hover:bg-ink/5" aria-label="Fermer" @click="cart.open.value = false"><Icon name="x" /></button>
        </header>

        <div v-if="!cart.lines.value.length" class="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
          <span class="grid h-20 w-20 place-items-center rounded-full bg-cream-2 text-4xl">🥙</span>
          <p class="font-display text-xl">Votre panier est vide</p>
          <p class="text-sm text-muted">Parcourez la carte et ajoutez vos plats préférés.</p>
          <NuxtLink to="/carte" class="btn-primary mt-2">Voir la carte</NuxtLink>
        </div>

        <ul v-else class="flex-1 divide-y divide-ink/5 overflow-y-auto px-6">
          <li v-for="line in cart.lines.value" :key="line.menuItemId" class="flex gap-4 py-4">
            <div class="h-20 w-20 shrink-0 overflow-hidden rounded-2xl">
              <DishImage :src="line.image_url" :alt="line.name" />
            </div>
            <div class="flex min-w-0 flex-1 flex-col">
              <div class="flex items-start justify-between gap-2">
                <p class="truncate font-semibold">{{ line.name }}</p>
                <button class="text-muted transition hover:text-ember" :aria-label="`Retirer ${line.name}`" @click="cart.remove(line.menuItemId)"><Icon name="trash" :size="16" /></button>
              </div>
              <p class="text-sm text-muted">{{ formatPrice(line.price) }}</p>
              <div class="mt-auto flex items-center justify-between">
                <QuantityStepper :model-value="line.quantity" size="sm" @update:model-value="cart.setQuantity(line.menuItemId, $event)" />
                <span class="font-bold tabular-nums">{{ formatPrice(Number(line.price) * line.quantity) }}</span>
              </div>
            </div>
          </li>
        </ul>

        <footer v-if="cart.lines.value.length" class="border-t border-ink/10 bg-white/70 px-6 py-5">
          <div class="flex items-baseline justify-between">
            <span class="text-sm text-muted">Total TTC</span>
            <span class="font-display text-3xl font-bold">{{ formatPrice(cart.total.value) }}</span>
          </div>
          <button class="btn-primary mt-4 w-full !py-4 text-base" @click="checkout">
            <Icon name="lock" :size="18" /> Commander et payer
          </button>
          <p class="mt-3 text-center text-xs text-muted">Paiement sécurisé par Stripe · À emporter</p>
        </footer>
      </aside>
    </Transition>
  </Teleport>
</template>
