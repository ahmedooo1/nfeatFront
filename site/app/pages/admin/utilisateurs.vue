<script setup lang="ts">
import type { User } from '~/types'
definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Clients', robots: 'noindex' })

const api = useApi()
const toast = useToast()
const { user: me } = useAuth()
const page = ref(1)
const limit = 20
const data = ref<{ data: User[]; total: number } | null>(null)
const pages = computed(() => Math.max(1, Math.ceil((data.value?.total ?? 0) / limit)))
const load = async () => (data.value = await api<{ data: User[]; total: number }>('/admin/users', { query: { page: page.value, limit } }).catch(() => ({ data: [], total: 0 })))
watch(page, load, { immediate: true })

async function toggleAdmin(u: User) {
  const isAdmin = u.roles.includes('ROLE_ADMIN')
  if (!confirm(isAdmin ? `Retirer les droits d’administration de ${u.name ?? u.email} ?` : `Donner les droits d’administration à ${u.name ?? u.email} ?`)) return
  try {
    await api(`/admin/users/${u.id}/update`, { method: 'POST', body: { roles: isAdmin ? ['ROLE_USER'] : ['ROLE_USER', 'ROLE_ADMIN'] } })
    toast.success('Rôle mis à jour.')
    load()
  } catch (e) {
    toast.error(apiMessage(e))
  }
}
</script>

<template>
  <div>
    <h1 class="text-4xl font-bold">Clients</h1>
    <p class="mt-1 text-gray-300">{{ data?.total ?? 0 }} compte(s)</p>
    <section class="card mt-8 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[560px] text-left text-sm">
          <thead class="bg-gray-700 text-xs uppercase tracking-wider text-gray-300">
            <tr><th class="px-6 py-3">Client</th><th class="px-6 py-3">Rôle</th><th class="px-6 py-3 text-right">Action</th></tr>
          </thead>
          <tbody class="divide-y divide-white/10">
            <tr v-for="u in data?.data ?? []" :key="u.id">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <span class="grid h-10 w-10 place-items-center rounded-full bg-brand text-xs font-extrabold">{{ initials(u.name) }}</span>
                  <div><p class="font-semibold">{{ u.name ?? '-' }}</p><p class="text-xs text-gray-300">{{ u.email }}</p></div>
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="rounded-full px-3 py-1 text-xs font-bold" :class="u.roles.includes('ROLE_ADMIN') ? 'bg-brand/20 text-brand' : 'bg-white/10 text-gray-300'">{{ u.roles.includes('ROLE_ADMIN') ? 'Administrateur' : 'Client' }}</span>
              </td>
              <td class="px-6 py-4 text-right">
                <button v-if="u.id !== me?.id" class="btn-ghost !px-4 !py-2 text-xs" @click="toggleAdmin(u)">{{ u.roles.includes('ROLE_ADMIN') ? 'Retirer admin' : 'Rendre admin' }}</button>
                <span v-else class="text-xs text-gray-300">Vous</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="flex items-center justify-between border-t border-white/10 px-6 py-4 text-sm">
        <button class="btn-ghost !py-2" :disabled="page <= 1" @click="page--">Précédent</button>
        <span class="text-gray-300">Page {{ page }} / {{ pages }}</span>
        <button class="btn-ghost !py-2" :disabled="page >= pages" @click="page++">Suivant</button>
      </div>
    </section>
  </div>
</template>
