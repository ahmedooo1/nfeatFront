<script setup lang="ts">
import { restaurant } from '~/restaurant.config'
useSeoMeta({ title: 'Contact', description: `Contactez ${restaurant.name} pour toute question, commande ou événement.` })

const api = useApi()
const { user } = useAuth()
const form = reactive({ name: '', email: '', message: '' })
const state = ref<'idle' | 'sending' | 'sent'>('idle')
const error = ref('')
onMounted(() => {
  form.name ||= user.value?.name ?? ''
  form.email ||= user.value?.email ?? ''
})

async function send() {
  state.value = 'sending'
  error.value = ''
  try {
    await api('/contact/submit', { method: 'POST', body: form })
    state.value = 'sent'
  } catch (e) {
    error.value = apiMessage(e, 'Le message n’a pas pu être envoyé.')
    state.value = 'idle'
  }
}
</script>

<template>
  <div class="container-x max-w-3xl py-12">
    <div class="text-center"><h1 class="brush-title">Contactez-nous</h1></div>

    <div class="mt-10 grid gap-4 text-sm sm:grid-cols-2">
      <div class="card flex items-center gap-3 p-4">
        <Icon name="pin" class="text-brand" />
        <span>{{ [restaurant.address.street, `${restaurant.address.postalCode} ${restaurant.address.city}`].filter(Boolean).join(', ') }}</span>
      </div>
      <div class="card flex items-center gap-3 p-4">
        <Icon name="clock" class="shrink-0 text-brand" />
        <span><template v-for="(h, i) in restaurant.hours" :key="h.label">{{ i ? '. ' : '' }}{{ h.label }} de {{ formatHour(h.open) }} à {{ formatHour(h.close) }}</template></span>
      </div>
    </div>

    <div v-if="state === 'sent'" class="card mt-6 p-10 text-center">
      <Icon name="check" :size="40" class="mx-auto text-green-400" />
      <p class="mt-4 text-2xl font-bold">Message envoyé</p>
      <p class="mt-2 text-gray-200">Merci {{ form.name.split(' ')[0] }}, nous vous répondrons rapidement.</p>
    </div>
    <form v-else class="card mt-6 space-y-5 p-6 sm:p-8" @submit.prevent="send">
      <div class="grid gap-5 sm:grid-cols-2">
        <div><label class="label" for="c-name">Nom</label><input id="c-name" v-model="form.name" class="field" maxlength="100" autocomplete="name" placeholder="Votre nom" required></div>
        <div><label class="label" for="c-email">E-mail</label><input id="c-email" v-model="form.email" type="email" class="field" autocomplete="email" placeholder="Votre e-mail" required></div>
      </div>
      <div>
        <label class="label" for="c-message">Message</label>
        <textarea id="c-message" v-model="form.message" class="field min-h-40 resize-y" maxlength="5000" placeholder="Votre message" required />
      </div>
      <p v-if="error" class="rounded bg-red-500/20 px-4 py-3 text-sm text-red-200">{{ error }}</p>
      <button class="btn-primary" :disabled="state === 'sending'">{{ state === 'sending' ? 'Envoi...' : 'Envoyer le message' }}</button>
    </form>
  </div>
</template>
