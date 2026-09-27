<script setup lang="ts">
definePageMeta({ middleware: 'auth', alias: ['/profile'] })
useSeoMeta({ title: 'Mon compte', robots: 'noindex' })

const api = useApi()
const toast = useToast()
const { user, fetchUser, logout } = useAuth()

const form = reactive({ name: user.value?.name ?? '', email: user.value?.email ?? '', plainPassword: '', currentPassword: '' })
const picture = ref<string | null>(null)
const preview = ref<string | null>(user.value?.picture ? `data:image/jpeg;base64,${user.value.picture}` : null)
const saving = ref(false)
const needsCurrent = computed(() => form.email !== user.value?.email || !!form.plainPassword)

function onFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (file.size > 2 * 1024 * 1024) return toast.error('Image trop lourde (2 Mo maximum).')
  const reader = new FileReader()
  reader.onload = () => {
    preview.value = String(reader.result)
    picture.value = String(reader.result)
  }
  reader.readAsDataURL(file)
}

async function save() {
  saving.value = true
  try {
    await api('/user/edit', {
      method: 'POST',
      body: {
        name: form.name,
        email: form.email,
        ...(form.plainPassword ? { plainPassword: form.plainPassword } : {}),
        ...(needsCurrent.value ? { currentPassword: form.currentPassword } : {}),
        ...(picture.value ? { picture: picture.value } : {}),
      },
    })
    await fetchUser()
    form.plainPassword = ''
    form.currentPassword = ''
    picture.value = null
    toast.success('Profil mis à jour.')
  } catch (e) {
    toast.error(apiMessage(e))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="container-x max-w-4xl py-12 sm:py-16">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="mt-3 text-3xl font-bold sm:text-4xl">Mon compte</h1>
      </div>
      <NuxtLink to="/compte/commandes" class="btn-ghost"><Icon name="receipt" :size="18" /> Mes commandes</NuxtLink>
    </div>

    <form class="card mt-10 grid gap-8 p-6 sm:p-10 md:grid-cols-3" @submit.prevent="save">
      <div class="flex flex-col items-center text-center">
        <label class="group relative block h-32 w-32 cursor-pointer overflow-hidden rounded-full bg-brand ring-4 ring-gray-800">
          <img v-if="preview" :src="preview" alt="Photo de profil" class="h-full w-full object-cover">
          <span v-else class="grid h-full w-full place-items-center text-4xl font-bold">{{ initials(user?.name) }}</span>
          <span class="absolute inset-0 grid place-items-center bg-black/60 text-white opacity-0 transition group-hover:opacity-100"><Icon name="image" /></span>
          <input type="file" accept="image/*" class="sr-only" @change="onFile">
        </label>
        <p class="mt-4 text-xl font-semibold">{{ user?.name }}</p>
        <p class="text-sm text-gray-300">{{ user?.email }}</p>
      </div>

      <div class="space-y-5 md:col-span-2">
        <div class="grid gap-5 sm:grid-cols-2">
          <div><label class="label" for="name">Nom</label><input id="name" v-model="form.name" class="field" autocomplete="name" required></div>
          <div><label class="label" for="email">E-mail</label><input id="email" v-model="form.email" type="email" class="field" autocomplete="email" required></div>
        </div>
        <div>
          <label class="label" for="new-password">Nouveau mot de passe</label>
          <input id="new-password" v-model="form.plainPassword" type="password" class="field" minlength="8" autocomplete="new-password" placeholder="Laisser vide pour le conserver">
        </div>
        <Transition name="fade">
          <div v-if="needsCurrent" class="rounded-lg bg-brand/15 p-4">
            <label class="label" for="current-password">Mot de passe actuel</label>
            <input id="current-password" v-model="form.currentPassword" type="password" class="field" autocomplete="current-password" required>
            <p class="mt-2 text-xs text-gray-300">Par sécurité, il est demandé pour changer d’e-mail ou de mot de passe.</p>
          </div>
        </Transition>
        <div class="flex flex-wrap justify-between gap-3 pt-2">
          <button type="button" class="btn-ghost" @click="logout"><Icon name="logout" :size="18" /> Se déconnecter</button>
          <button class="btn-primary" :disabled="saving">{{ saving ? 'Enregistrement...' : 'Enregistrer' }}</button>
        </div>
      </div>
    </form>
  </div>
</template>
