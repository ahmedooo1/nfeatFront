<script setup lang="ts">
const { loginOpen, login, register } = useAuth()
const redirect = useState<string | null>('auth:redirect', () => null)
const mode = ref<'login' | 'register' | 'forgot'>('login')
const busy = ref(false)
const error = ref('')
const info = ref('')
const form = reactive({ name: '', email: '', password: '', agree: false })

watch(loginOpen, (v) => {
  if (v) {
    error.value = ''
    info.value = ''
  }
})

function close() {
  loginOpen.value = false
  redirect.value = null
}

async function submit() {
  busy.value = true
  error.value = ''
  info.value = ''
  try {
    if (mode.value === 'login') {
      await login(form.email, form.password)
    } else if (mode.value === 'register') {
      await register({ name: form.name, email: form.email, plainPassword: form.password, agreeTerms: form.agree })
    } else {
      const res = await useApi()<{ message: string }>('/request-reset-password', { method: 'POST', body: { email: form.email } })
      info.value = res.message
      return
    }
    const target = redirect.value
    loginOpen.value = false
    redirect.value = null
    useToast().success(mode.value === 'login' ? 'Vous êtes connecté.' : `Compte créé. Confirmez votre adresse avec le lien envoyé à ${form.email}.`)
    if (target) navigateTo(target)
  } catch (e) {
    const status = (e as { status?: number }).status
    error.value = mode.value === 'login' && status === 401 ? 'E-mail ou mot de passe incorrect. Après 5 essais, patientez 15 minutes.' : apiMessage(e)
  } finally {
    busy.value = false
    form.password = ''
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="loginOpen" class="fixed inset-0 z-[70] grid place-items-center bg-black/60 p-4" @click.self="close">
        <div class="relative w-full max-w-md rounded-lg bg-night p-7 text-white shadow-2xl" role="dialog" aria-modal="true">
          <button class="absolute right-3 top-3 rounded-full p-2 hover:bg-white/10" aria-label="Fermer" @click="close"><Icon name="x" :size="18" /></button>
          <img src="/images/logo.png" alt="" class="mx-auto w-20">
          <form class="mt-4 space-y-4" @submit.prevent="submit">
            <h2 class="text-center text-2xl font-bold">
              {{ mode === 'login' ? 'Connexion' : mode === 'register' ? 'Inscription' : 'Mot de passe oublié' }}
            </h2>
            <p v-if="mode === 'forgot'" class="text-center text-sm text-gray-300">Recevez un lien de réinitialisation par e-mail.</p>

            <div v-if="mode === 'register'">
              <label class="label" for="auth-name">Nom</label>
              <input id="auth-name" v-model="form.name" class="field" autocomplete="name" required>
            </div>
            <div>
              <label class="label" for="auth-email">E-mail</label>
              <input id="auth-email" v-model="form.email" type="email" class="field" autocomplete="email" required>
            </div>
            <div v-if="mode !== 'forgot'">
              <label class="label" for="auth-password">Mot de passe</label>
              <input id="auth-password" v-model="form.password" type="password" class="field" :autocomplete="mode === 'login' ? 'current-password' : 'new-password'" :minlength="mode === 'register' ? 8 : undefined" required>
              <p v-if="mode === 'register'" class="mt-1 text-xs text-gray-400">8 caractères minimum.</p>
              <button v-if="mode === 'login'" type="button" class="mt-2 text-sm text-brand underline" @click="mode = 'forgot'">Mot de passe oublié ?</button>
            </div>
            <label v-if="mode === 'register'" class="flex items-start gap-2 text-sm text-gray-300">
              <input v-model="form.agree" type="checkbox" class="mt-1 h-4 w-4 accent-yellow-500" required>
              <span>J’accepte les <NuxtLink to="/mentions-legales" class="underline" target="_blank">conditions</NuxtLink> et la <NuxtLink to="/confidentialite" class="underline" target="_blank">politique de confidentialité</NuxtLink>.</span>
            </label>

            <p v-if="error" class="rounded bg-red-500/20 px-3 py-2 text-sm text-red-200">{{ error }}</p>
            <p v-if="info" class="rounded bg-green-500/20 px-3 py-2 text-sm text-green-200">{{ info }}</p>

            <button class="btn-primary w-full" :disabled="busy">
              {{ busy ? 'Patientez...' : mode === 'login' ? 'Se connecter' : mode === 'register' ? 'Créer mon compte' : 'Envoyer le lien' }}
            </button>
            <p class="text-center text-sm text-gray-300">
              <template v-if="mode === 'login'">Pas encore de compte ? <button type="button" class="font-semibold text-brand underline" @click="mode = 'register'">Inscrivez-vous</button></template>
              <template v-else>Déjà inscrit ? <button type="button" class="font-semibold text-brand underline" @click="mode = 'login'">Connectez-vous</button></template>
            </p>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
