<script setup lang="ts">
import { restaurant } from '~/restaurant.config'
useSeoMeta({ title: 'Contact', description: `Contactez ${restaurant.name} : question, traiteur, événement. Nous répondons rapidement.` })

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
  <div class="container-x grid gap-12 py-12 sm:py-20 lg:grid-cols-5">
    <div class="lg:col-span-2">
      <p class="eyebrow">Contact</p>
      <h1 class="mt-3 font-display text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl">Parlons&nbsp;!</h1>
      <p class="mt-5 text-lg text-muted">Une question sur un plat, un allergène, une commande traiteur ? Écrivez-nous, nous répondons vite.</p>
      <ul class="mt-10 space-y-5">
        <li class="flex gap-4">
          <span class="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-ember/10 text-ember"><Icon name="pin" /></span>
          <div><p class="font-semibold">Adresse</p><p class="text-muted">{{ [restaurant.address.street, `${restaurant.address.postalCode} ${restaurant.address.city}`].filter(Boolean).join(', ') }}</p></div>
        </li>
        <li class="flex gap-4">
          <span class="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-ember/10 text-ember"><Icon name="clock" /></span>
          <div><p class="font-semibold">Horaires</p><p v-for="h in restaurant.hours" :key="h.label" class="text-muted">{{ h.label }} · {{ h.open.replace(':', 'h') }} – {{ h.close.replace(':', 'h') }}</p></div>
        </li>
        <li v-if="restaurant.phone" class="flex gap-4">
          <span class="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-ember/10 text-ember"><Icon name="phone" /></span>
          <div><p class="font-semibold">Téléphone</p><a :href="`tel:${restaurant.phone.replace(/\s/g, '')}`" class="text-muted hover:text-ink">{{ restaurant.phone }}</a></div>
        </li>
      </ul>
    </div>

    <div class="lg:col-span-3">
      <div v-if="state === 'sent'" class="card flex h-full flex-col items-center justify-center p-12 text-center">
        <span class="grid h-16 w-16 place-items-center rounded-full bg-olive text-white"><Icon name="check" :size="30" :stroke="2.6" /></span>
        <p class="mt-5 font-display text-3xl font-semibold">Message envoyé&nbsp;!</p>
        <p class="mt-2 text-muted">Merci {{ form.name.split(' ')[0] }}, nous revenons vers vous très vite.</p>
      </div>
      <form v-else class="card space-y-5 p-6 sm:p-10" @submit.prevent="send">
        <div class="grid gap-5 sm:grid-cols-2">
          <div><label class="label" for="c-name">Nom</label><input id="c-name" v-model="form.name" class="field" maxlength="100" autocomplete="name" required></div>
          <div><label class="label" for="c-email">E-mail</label><input id="c-email" v-model="form.email" type="email" class="field" autocomplete="email" required></div>
        </div>
        <div>
          <label class="label" for="c-message">Message</label>
          <textarea id="c-message" v-model="form.message" class="field min-h-44 resize-y" maxlength="5000" required placeholder="Bonjour, je souhaiterais…" />
        </div>
        <p v-if="error" class="rounded-2xl bg-ember/10 px-4 py-3 text-sm font-medium text-ember-dark">{{ error }}</p>
        <button class="btn-primary w-full !py-4 sm:w-auto" :disabled="state === 'sending'">{{ state === 'sending' ? 'Envoi…' : 'Envoyer le message' }} <Icon name="arrow" :size="18" /></button>
      </form>
    </div>
  </div>
</template>
