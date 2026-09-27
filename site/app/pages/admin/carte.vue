<script setup lang="ts">
import type { Category, Dish } from '~/types'
definePageMeta({ layout: 'admin', middleware: 'admin', alias: ['/admin/Menu', '/admin/menu'] })
useSeoMeta({ title: 'La carte', robots: 'noindex' })

const api = useApi()
const toast = useToast()
const dishes = ref<Dish[]>([])
const categories = ref<Category[]>([])
const query = ref('')
const loading = ref(true)

async function load() {
  loading.value = true
  const [rows, cats] = await Promise.all([api<unknown[]>('/menu').catch(() => []), api<Category[]>('/categories').catch(() => [])])
  dishes.value = normalizeDishes(rows as never)
  categories.value = cats
  loading.value = false
}
onMounted(load)

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return q ? dishes.value.filter((d) => `${d.name} ${d.category?.title}`.toLowerCase().includes(q)) : dishes.value
})

// Formulaire (création ou modification)
const editing = ref<Dish | null>(null)
const open = ref(false)
const saving = ref(false)
const form = reactive({ name: '', description: '', price: '', category_id: 0 as number, image: null as string | null, preview: null as string | null })

function start(dish?: Dish) {
  editing.value = dish ?? null
  Object.assign(form, {
    name: dish?.name ?? '',
    description: dish?.description ?? '',
    price: dish?.price ?? '',
    category_id: dish?.category?.id ?? categories.value[0]?.id ?? 0,
    image: null,
    preview: imageUrl(dish?.image_url),
  })
  open.value = true
}

function onFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) return toast.error('Image trop lourde (5 Mo maximum).')
  const reader = new FileReader()
  reader.onload = () => {
    form.image = String(reader.result)
    form.preview = form.image
  }
  reader.readAsDataURL(file)
}

async function save() {
  saving.value = true
  const body = { name: form.name, description: form.description, price: String(form.price).replace(',', '.'), category_id: form.category_id, ...(form.image ? { image_url: form.image } : {}) }
  try {
    if (editing.value) await api(`/menu/${editing.value.id}`, { method: 'PUT', body })
    else await api('/menu', { method: 'POST', body })
    toast.success(editing.value ? 'Plat mis à jour.' : 'Plat ajouté à la carte.')
    open.value = false
    await load()
  } catch (e) {
    toast.error(apiMessage(e))
  } finally {
    saving.value = false
  }
}

async function toggle(d: Dish) {
  const available = d.available === false
  try {
    await api(`/menu/${d.id}`, { method: 'PUT', body: { available } })
    d.available = available
    toast.success(available ? `${d.name} est de nouveau disponible.` : `${d.name} est indisponible.`)
  } catch (e) {
    toast.error(apiMessage(e))
  }
}

async function remove(d: Dish) {
  if (!confirm(`Supprimer « ${d.name} » de la carte ?`)) return
  try {
    await api(`/menu/${d.id}`, { method: 'DELETE' })
    dishes.value = dishes.value.filter((x) => x.id !== d.id)
    toast.success('Plat supprimé.')
  } catch (e) {
    toast.error(apiMessage(e))
  }
}
</script>

<template>
  <div>
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="text-4xl font-bold">La carte</h1>
        <p class="mt-1 text-gray-300">{{ dishes.length }} plat(s) en ligne</p>
      </div>
      <div class="flex gap-2">
        <label class="relative">
          <span class="sr-only">Rechercher</span>
          <Icon name="search" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" :size="16" />
          <input v-model="query" type="search" class="field !rounded-full !py-2.5 !pl-10" placeholder="Rechercher...">
        </label>
        <button class="btn-primary" @click="start()"><Icon name="plus" :size="18" /> Nouveau plat</button>
      </div>
    </div>

    <div v-if="loading" class="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3"><div v-for="i in 6" :key="i" class="skeleton h-28" /></div>
    <div v-else class="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <article v-for="d in filtered" :key="d.id" class="card flex gap-4 p-3">
        <div class="h-24 w-24 shrink-0 overflow-hidden rounded-lg" :class="{ 'opacity-40': d.available === false }"><DishImage :src="d.image_url" :alt="d.name" /></div>
        <div class="flex min-w-0 flex-1 flex-col py-1">
          <p class="truncate font-semibold">{{ d.name }}</p>
          <p class="text-xs text-gray-300">{{ d.category?.title ?? 'Sans catégorie' }}</p>
          <p class="mt-auto text-lg font-bold text-brand">{{ formatPrice(d.price) }}</p>
          <button class="mt-1 flex w-fit items-center gap-2 text-xs font-semibold" role="switch" :aria-checked="d.available !== false" @click="toggle(d)">
            <span class="relative h-5 w-9 rounded-full transition" :class="d.available !== false ? 'bg-green-600' : 'bg-white/20'"><span class="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all" :class="d.available !== false ? 'left-[18px]' : 'left-0.5'" /></span>
            {{ d.available !== false ? 'Disponible' : 'Indisponible' }}
          </button>
        </div>
        <div class="flex flex-col gap-1">
          <button class="grid h-9 w-9 place-items-center rounded-full hover:bg-white/10" aria-label="Modifier" @click="start(d)"><Icon name="edit" :size="16" /></button>
          <button class="grid h-9 w-9 place-items-center rounded-full text-gray-300 hover:bg-white/10 hover:text-brand" aria-label="Supprimer" @click="remove(d)"><Icon name="trash" :size="16" /></button>
        </div>
      </article>
    </div>

    <Teleport to="body">
      <Transition name="fade">
        <div v-if="open" class="fixed inset-0 z-[70] grid place-items-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm" @click.self="open = false">
          <form class="card w-full max-w-2xl p-6 sm:p-8" @submit.prevent="save">
            <div class="flex items-center justify-between">
              <h2 class="text-3xl font-semibold">{{ editing ? 'Modifier le plat' : 'Nouveau plat' }}</h2>
              <button type="button" class="grid h-10 w-10 place-items-center rounded-full hover:bg-white/10" aria-label="Fermer" @click="open = false"><Icon name="x" /></button>
            </div>
            <div class="mt-6 grid gap-6 sm:grid-cols-5">
              <label class="group relative block aspect-square cursor-pointer overflow-hidden rounded-lg border-2 border-dashed border-white/20 sm:col-span-2">
                <img v-if="form.preview" :src="form.preview" alt="" class="h-full w-full object-cover">
                <span v-else class="grid h-full place-items-center p-4 text-center text-sm text-gray-300"><span><Icon name="image" :size="28" class="mx-auto" /><br>Ajouter une photo</span></span>
                <span class="absolute inset-x-3 bottom-3 rounded-full bg-gray-900/70 py-2 text-center text-xs font-bold text-white opacity-0 transition group-hover:opacity-100">Changer la photo</span>
                <input type="file" accept="image/jpeg,image/png,image/webp" class="sr-only" @change="onFile">
              </label>
              <div class="space-y-4 sm:col-span-3">
                <div><label class="label" for="d-name">Nom</label><input id="d-name" v-model="form.name" class="field" required maxlength="255"></div>
                <div class="grid grid-cols-2 gap-4">
                  <div><label class="label" for="d-price">Prix (€)</label><input id="d-price" v-model="form.price" class="field" inputmode="decimal" required pattern="\d+([.,]\d{1,2})?"></div>
                  <div>
                    <label class="label" for="d-cat">Catégorie</label>
                    <select id="d-cat" v-model.number="form.category_id" class="field" required>
                      <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.title }}</option>
                    </select>
                  </div>
                </div>
                <div><label class="label" for="d-desc">Description</label><textarea id="d-desc" v-model="form.description" class="field min-h-28" required /></div>
              </div>
            </div>
            <div class="mt-6 flex justify-end gap-2">
              <button type="button" class="btn-ghost" @click="open = false">Annuler</button>
              <button class="btn-primary" :disabled="saving">{{ saving ? 'Enregistrement...' : 'Enregistrer' }}</button>
            </div>
          </form>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
