<script setup lang="ts">
// Lien reçu par e-mail pour confirmer l'adresse.
useSeoMeta({ title: 'Confirmation de l’adresse e-mail', robots: 'noindex' })

const route = useRoute()
const api = useApi()
const cart = useCart()
const { loggedIn, fetchUser } = useAuth()
const state = ref<'loading' | 'ok' | 'error'>('loading')
const error = ref('')

onMounted(async () => {
  try {
    await api('/user/verify-email', { method: 'POST', body: { token: String(route.query.token ?? '') } })
    state.value = 'ok'
    if (loggedIn.value) await fetchUser()
    await cart.refresh().catch(() => {})
  } catch (e) {
    error.value = apiMessage(e, 'Ce lien n’est plus valide. Demandez un nouvel e-mail depuis votre compte.')
    state.value = 'error'
  }
})
</script>

<template>
  <div class="container-x max-w-xl py-16">
    <div class="card p-10 text-center">
      <template v-if="state === 'loading'">
        <div class="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-brand/20 border-t-brand" />
        <p class="mt-5 text-xl">Confirmation en cours...</p>
      </template>
      <template v-else-if="state === 'ok'">
        <span class="mx-auto grid h-16 w-16 place-items-center rounded-full bg-green-600 text-white"><Icon name="check" :size="32" :stroke="2.6" /></span>
        <h1 class="mt-5 text-2xl font-bold">Adresse e-mail confirmée</h1>
        <p class="mt-2 text-gray-300">Vous pouvez maintenant commander.</p>
        <NuxtLink :to="cart.lines.value.length ? '/commande' : '/carte'" class="btn-primary mt-6">{{ cart.lines.value.length ? 'Finaliser ma commande' : 'Voir le menu' }}</NuxtLink>
      </template>
      <template v-else>
        <h1 class="text-2xl font-bold">Lien invalide</h1>
        <p class="mt-2 text-gray-300">{{ error }}</p>
        <NuxtLink to="/compte" class="btn-primary mt-6">Mon compte</NuxtLink>
      </template>
    </div>
  </div>
</template>
