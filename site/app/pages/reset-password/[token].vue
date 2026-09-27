<script setup lang="ts">
useSeoMeta({ title: 'Nouveau mot de passe', robots: 'noindex' })
const route = useRoute()
const api = useApi()
const { loginOpen } = useAuth()
const password = ref('')
const confirmation = ref('')
const state = ref<'idle' | 'saving' | 'done'>('idle')
const error = ref('')

async function submit() {
  error.value = ''
  if (password.value !== confirmation.value) {
    error.value = 'Les deux mots de passe ne correspondent pas.'
    return
  }
  state.value = 'saving'
  try {
    await api(`/reset-password/${route.params.token}`, { method: 'POST', body: { password: password.value } })
    state.value = 'done'
  } catch (e) {
    error.value = apiMessage(e)
    state.value = 'idle'
  }
}
</script>

<template>
  <div class="container-x grid min-h-[70vh] place-items-center py-16">
    <div class="card w-full max-w-md p-8">
      <template v-if="state === 'done'">
        <span class="grid h-14 w-14 place-items-center rounded-full bg-green-600 text-white"><Icon name="check" :size="26" :stroke="2.6" /></span>
        <h1 class="mt-5 text-3xl font-semibold">Mot de passe modifié</h1>
        <p class="mt-2 text-gray-300">Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</p>
        <button class="btn-primary mt-6 w-full" @click="loginOpen = true">Se connecter</button>
      </template>
      <form v-else class="space-y-5" @submit.prevent="submit">
        <h1 class="text-3xl font-semibold">Nouveau mot de passe</h1>
        <div><label class="label" for="p1">Mot de passe</label><input id="p1" v-model="password" type="password" minlength="8" class="field" autocomplete="new-password" required></div>
        <div><label class="label" for="p2">Confirmation</label><input id="p2" v-model="confirmation" type="password" minlength="8" class="field" autocomplete="new-password" required></div>
        <p v-if="error" class="rounded-lg bg-red-500/20 px-4 py-3 text-sm text-red-200">{{ error }}</p>
        <button class="btn-primary w-full" :disabled="state === 'saving'">Enregistrer</button>
      </form>
    </div>
  </div>
</template>
