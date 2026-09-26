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
    useToast().success(mode.value === 'login' ? 'Content de vous revoir !' : 'Bienvenue chez NF-EAT !')
    if (target) navigateTo(target)
  } catch (e) {
    const status = (e as { status?: number }).status
    error.value = mode.value === 'login' && status === 401 ? 'E-mail ou mot de passe incorrect (ou trop de tentatives : patientez un quart d’heure).' : apiMessage(e)
  } finally {
    busy.value = false
    form.password = ''
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="loginOpen" class="fixed inset-0 z-[70] grid place-items-center bg-ink/50 p-4 backdrop-blur-sm" @click.self="close">
        <div class="relative w-full max-w-md overflow-hidden rounded-[2rem] bg-cream shadow-2xl" role="dialog" aria-modal="true">
          <div class="relative h-28 overflow-hidden bg-ink grain">
            <img src="/images/restaurant.jpg" alt="" class="h-full w-full object-cover opacity-50">
            <button class="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-black/30 text-white hover:bg-black/50" aria-label="Fermer" @click="close"><Icon name="x" :size="18" /></button>
          </div>
          <form class="space-y-4 p-7" @submit.prevent="submit">
            <div>
              <h2 class="font-display text-3xl font-semibold">
                {{ mode === 'login' ? 'Bon retour' : mode === 'register' ? 'Créer un compte' : 'Mot de passe oublié' }}
              </h2>
              <p class="mt-1 text-sm text-muted">
                {{ mode === 'login' ? 'Connectez-vous pour commander et suivre vos commandes.' : mode === 'register' ? 'Commandez en deux clics et retrouvez votre historique.' : 'Recevez un lien de réinitialisation par e-mail.' }}
              </p>
            </div>

            <div v-if="mode === 'register'">
              <label class="label" for="auth-name">Prénom et nom</label>
              <input id="auth-name" v-model="form.name" class="field" autocomplete="name" required>
            </div>
            <div>
              <label class="label" for="auth-email">E-mail</label>
              <input id="auth-email" v-model="form.email" type="email" class="field" autocomplete="email" required>
            </div>
            <div v-if="mode !== 'forgot'">
              <div class="flex items-center justify-between">
                <label class="label" for="auth-password">Mot de passe</label>
                <button v-if="mode === 'login'" type="button" class="mb-1.5 text-xs font-semibold text-ember hover:underline" @click="mode = 'forgot'">Oublié ?</button>
              </div>
              <input id="auth-password" v-model="form.password" type="password" class="field" :autocomplete="mode === 'login' ? 'current-password' : 'new-password'" :minlength="mode === 'register' ? 8 : undefined" required>
              <p v-if="mode === 'register'" class="mt-1 text-xs text-muted">8 caractères minimum.</p>
            </div>
            <label v-if="mode === 'register'" class="flex items-start gap-3 text-sm text-muted">
              <input v-model="form.agree" type="checkbox" class="mt-0.5 h-4 w-4 accent-[var(--color-ember)]" required>
              <span>J'accepte les <NuxtLink to="/mentions-legales" class="underline" target="_blank">conditions</NuxtLink> et la <NuxtLink to="/confidentialite" class="underline" target="_blank">politique de confidentialité</NuxtLink>.</span>
            </label>

            <p v-if="error" class="rounded-2xl bg-ember/10 px-4 py-3 text-sm font-medium text-ember-dark">{{ error }}</p>
            <p v-if="info" class="rounded-2xl bg-olive/10 px-4 py-3 text-sm font-medium text-olive">{{ info }}</p>

            <button class="btn-primary w-full !py-3.5" :disabled="busy">
              {{ busy ? 'Un instant…' : mode === 'login' ? 'Se connecter' : mode === 'register' ? 'Créer mon compte' : 'Envoyer le lien' }}
            </button>

            <p class="text-center text-sm text-muted">
              <template v-if="mode === 'login'">Pas encore de compte ? <button type="button" class="font-bold text-ink hover:underline" @click="mode = 'register'">Inscrivez-vous</button></template>
              <template v-else>Déjà inscrit ? <button type="button" class="font-bold text-ink hover:underline" @click="mode = 'login'">Connectez-vous</button></template>
            </p>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
