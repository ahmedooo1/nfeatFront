<script setup lang="ts">
import type { OrderSummary } from '~/types'

definePageMeta({ middleware: 'auth', alias: ['/profile'] })
useSeoMeta({ title: 'Mon compte', robots: 'noindex' })

const api = useApi()
const toast = useToast()
const { user, fetchUser, logout } = useAuth()

// Commande en cours, mise en avant en haut de page.
const current = ref<OrderSummary | null>(null)
onMounted(async () => {
  fetchUser()
  const orders = await api<OrderSummary[]>('/orders').catch(() => [])
  current.value = orders.find((o) => isActiveOrder(o.status)) ?? null
})

async function edit(body: Record<string, unknown>, success: string) {
  await api('/user/edit', { method: 'POST', body })
  await fetchUser()
  toast.success(success)
}

// Photo : enregistrée dès qu'elle est choisie.
const preview = computed(() => (user.value?.picture ? `data:image/jpeg;base64,${user.value.picture}` : null))
function onFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (file.size > 2 * 1024 * 1024) return toast.error('Image trop lourde (2 Mo maximum).')
  const reader = new FileReader()
  reader.onload = () => edit({ picture: String(reader.result) }, 'Photo mise à jour.').catch((err) => toast.error(apiMessage(err)))
  reader.readAsDataURL(file)
}

// Informations personnelles : pas besoin du mot de passe.
const info = reactive({ name: '', phone: '' })
watchEffect(() => {
  info.name = user.value?.name ?? ''
  info.phone = user.value?.phone ?? ''
})
const infoChanged = computed(() => info.name.trim() !== (user.value?.name ?? '') || info.phone.trim() !== (user.value?.phone ?? ''))
const savingInfo = ref(false)
async function saveInfo() {
  savingInfo.value = true
  try {
    await edit({ name: info.name.trim(), phone: info.phone.trim() }, 'Informations enregistrées.')
  } catch (e) {
    toast.error(apiMessage(e))
  } finally {
    savingInfo.value = false
  }
}

// Adresse e-mail : mot de passe exigé, puis nouvelle confirmation.
const emailOpen = ref(false)
const emailForm = reactive({ email: '', currentPassword: '' })
const savingEmail = ref(false)
async function saveEmail() {
  savingEmail.value = true
  try {
    const email = emailForm.email.trim().toLowerCase()
    await edit({ email, currentPassword: emailForm.currentPassword }, `Adresse modifiée. Confirmez-la avec le lien envoyé à ${email}.`)
    emailOpen.value = false
    Object.assign(emailForm, { email: '', currentPassword: '' })
  } catch (e) {
    toast.error(apiMessage(e))
  } finally {
    savingEmail.value = false
  }
}

// Mot de passe.
const pwOpen = ref(false)
const pw = reactive({ currentPassword: '', plainPassword: '', confirm: '' })
const pwMismatch = computed(() => !!pw.confirm && pw.confirm !== pw.plainPassword)
const savingPw = ref(false)
async function savePassword() {
  if (pwMismatch.value) return
  savingPw.value = true
  try {
    await edit({ currentPassword: pw.currentPassword, plainPassword: pw.plainPassword }, 'Mot de passe modifié.')
    pwOpen.value = false
    Object.assign(pw, { currentPassword: '', plainPassword: '', confirm: '' })
  } catch (e) {
    toast.error(apiMessage(e))
  } finally {
    savingPw.value = false
  }
}
</script>

<template>
  <div class="container-x max-w-3xl py-12 sm:py-16">
    <div class="flex items-center gap-5">
      <label class="group relative block h-20 w-20 shrink-0 cursor-pointer overflow-hidden rounded-full bg-brand ring-4 ring-gray-700 sm:h-24 sm:w-24" title="Changer la photo">
        <img v-if="preview" :src="preview" alt="Photo de profil" class="h-full w-full object-cover">
        <span v-else class="grid h-full w-full place-items-center text-3xl font-bold">{{ initials(user?.name) }}</span>
        <span class="absolute inset-0 grid place-items-center bg-black/60 text-white opacity-0 transition group-hover:opacity-100"><Icon name="image" /></span>
        <input type="file" accept="image/jpeg,image/png,image/webp" class="sr-only" @change="onFile">
      </label>
      <div class="min-w-0">
        <h1 class="truncate text-3xl font-bold sm:text-4xl">{{ user?.name || 'Mon compte' }}</h1>
        <p class="truncate text-gray-300">{{ user?.email }}</p>
      </div>
    </div>

    <VerifyEmailNotice v-if="user && user.emailVerified === false" class="mt-8" />

    <NuxtLink v-if="current" :to="{ path: '/commande/suivi', query: { id: current.id } }" class="card mt-8 flex items-center justify-between gap-4 p-5 transition hover:bg-tile">
      <div>
        <p class="font-semibold">Commande #{{ current.id }} <span class="ml-2 rounded-full px-3 py-1 text-xs font-bold" :class="orderStatus[current.status]?.tone">{{ orderStatus[current.status]?.label }}</span></p>
        <p class="mt-1 text-sm text-gray-300 first-letter:uppercase">Retrait {{ formatPickup(current.pickupAt) }}</p>
      </div>
      <Icon name="arrow" :size="20" class="shrink-0 text-brand" />
    </NuxtLink>

    <div class="mt-8 grid gap-3 sm:grid-cols-2">
      <NuxtLink to="/compte/commandes" class="card flex items-center gap-3 p-5 font-semibold transition hover:bg-tile"><Icon name="receipt" :size="20" class="text-brand" /> Mes commandes</NuxtLink>
      <NuxtLink to="/carte" class="card flex items-center gap-3 p-5 font-semibold transition hover:bg-tile"><Icon name="utensils" :size="20" class="text-brand" /> Commander</NuxtLink>
    </div>

    <section class="card mt-8 p-6 sm:p-8">
      <h2 class="text-2xl font-semibold">Informations personnelles</h2>
      <form class="mt-5 grid gap-4 sm:grid-cols-2" @submit.prevent="saveInfo">
        <div><label class="label" for="name">Nom</label><input id="name" v-model="info.name" class="field" autocomplete="name" required maxlength="255"></div>
        <div>
          <label class="label" for="phone">Téléphone</label>
          <input id="phone" v-model="info.phone" type="tel" class="field" autocomplete="tel" placeholder="06 12 34 56 78">
          <p class="mt-1 text-xs text-gray-400">Proposé automatiquement à chaque commande.</p>
        </div>
        <div class="flex justify-end sm:col-span-2">
          <button class="btn-primary" :disabled="savingInfo || !infoChanged">{{ savingInfo ? 'Enregistrement...' : 'Enregistrer' }}</button>
        </div>
      </form>
    </section>

    <section class="card mt-6 p-6 sm:p-8">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="min-w-0">
          <h2 class="text-2xl font-semibold">Adresse e-mail</h2>
          <p class="mt-1 flex flex-wrap items-center gap-2 text-gray-300">
            <span class="truncate">{{ user?.email }}</span>
            <span v-if="user?.emailVerified" class="rounded-full bg-green-500/20 px-2.5 py-0.5 text-xs font-bold text-green-300">Confirmée</span>
            <span v-else class="rounded-full bg-brand/20 px-2.5 py-0.5 text-xs font-bold text-brand">Non confirmée</span>
          </p>
        </div>
        <button v-if="!emailOpen" class="btn-ghost !py-2" @click="emailOpen = true">Modifier</button>
      </div>
      <form v-if="emailOpen" class="mt-5 grid gap-4 sm:grid-cols-2" @submit.prevent="saveEmail">
        <div><label class="label" for="new-email">Nouvelle adresse</label><input id="new-email" v-model="emailForm.email" type="email" class="field" autocomplete="email" required></div>
        <div><label class="label" for="email-pw">Mot de passe actuel</label><input id="email-pw" v-model="emailForm.currentPassword" type="password" class="field" autocomplete="current-password" required></div>
        <p class="text-xs text-gray-400 sm:col-span-2">Un lien de confirmation sera envoyé à la nouvelle adresse.</p>
        <div class="flex justify-end gap-2 sm:col-span-2">
          <button type="button" class="btn-ghost" @click="emailOpen = false">Annuler</button>
          <button class="btn-primary" :disabled="savingEmail">{{ savingEmail ? 'Enregistrement...' : 'Changer d’adresse' }}</button>
        </div>
      </form>
    </section>

    <section class="card mt-6 p-6 sm:p-8">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h2 class="text-2xl font-semibold">Mot de passe</h2>
        <button v-if="!pwOpen" class="btn-ghost !py-2" @click="pwOpen = true">Modifier</button>
      </div>
      <form v-if="pwOpen" class="mt-5 grid gap-4" @submit.prevent="savePassword">
        <div><label class="label" for="cur-pw">Mot de passe actuel</label><input id="cur-pw" v-model="pw.currentPassword" type="password" class="field" autocomplete="current-password" required></div>
        <div class="grid gap-4 sm:grid-cols-2">
          <div><label class="label" for="new-pw">Nouveau mot de passe</label><input id="new-pw" v-model="pw.plainPassword" type="password" class="field" minlength="8" autocomplete="new-password" required><p class="mt-1 text-xs text-gray-400">8 caractères minimum.</p></div>
          <div>
            <label class="label" for="confirm-pw">Confirmation</label>
            <input id="confirm-pw" v-model="pw.confirm" type="password" class="field" autocomplete="new-password" required>
            <p v-if="pwMismatch" class="mt-1 text-xs text-red-300">Les deux mots de passe sont différents.</p>
          </div>
        </div>
        <div class="flex justify-end gap-2">
          <button type="button" class="btn-ghost" @click="pwOpen = false">Annuler</button>
          <button class="btn-primary" :disabled="savingPw || pwMismatch">{{ savingPw ? 'Enregistrement...' : 'Changer le mot de passe' }}</button>
        </div>
      </form>
    </section>

    <div class="mt-8 flex justify-center">
      <button class="btn-ghost" @click="logout"><Icon name="logout" :size="18" /> Se déconnecter</button>
    </div>
  </div>
</template>
