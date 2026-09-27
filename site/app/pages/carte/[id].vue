<script setup lang="ts">
import { restaurant } from '~/restaurant.config'
import type { Dish, Review } from '~/types'

definePageMeta({ alias: ['/menu/:id'] })

const route = useRoute()
const id = Number(route.params.id)
const { public: config } = useRuntimeConfig()
const api = useApi()
const cart = useCart()
const { user, loggedIn, isAdmin, loginOpen } = useAuth()
const toast = useToast()

const dishRequest = useAsyncData(`dish-${id}`, () =>
  $fetch<Omit<Dish, 'commentCount'>>(`${config.apiBase}/api/menu/${id}`).then((d) => ({ ...d, commentCount: 0 }) as Dish),
)
// Page pré-rendue : prix et description relus dans le navigateur.
if (import.meta.client) onMounted(() => dishRequest.refresh())
const { data: dish, error } = await dishRequest
if (error.value || !dish.value) {
  throw createError({ statusCode: 404, message: 'Ce plat n’existe pas ou plus.', fatal: true })
}

const reviews = ref<Review[]>([])
const loadReviews = async () => (reviews.value = await api<Review[]>('/comments', { query: { menuItemId: id } }).catch(() => []))
onMounted(loadReviews)

const quantity = ref(1)
const adding = ref(false)
async function add() {
  adding.value = true
  try {
    await cart.add(dish.value!, quantity.value)
    quantity.value = 1
  } catch (e) {
    toast.error(apiMessage(e))
  } finally {
    adding.value = false
  }
}

const draft = ref('')
const posting = ref(false)
const editing = ref<number | null>(null)
const editText = ref('')

async function postReview() {
  if (!draft.value.trim()) return
  posting.value = true
  try {
    const created = await api<Review>('/comments', { method: 'POST', body: { menuItemId: id, content: draft.value } })
    reviews.value.unshift(created)
    draft.value = ''
    toast.success('Commentaire publié.')
  } catch (e) {
    toast.error(apiMessage(e))
  } finally {
    posting.value = false
  }
}
async function saveEdit(r: Review) {
  try {
    const updated = await api<Review>(`/comments/${r.id}`, { method: 'PUT', body: { content: editText.value } })
    Object.assign(r, updated)
    editing.value = null
  } catch (e) {
    toast.error(apiMessage(e))
  }
}
async function removeReview(r: Review) {
  if (!confirm('Supprimer ce commentaire ?')) return
  try {
    await api(`/comments/${r.id}`, { method: 'DELETE' })
    reviews.value = reviews.value.filter((x) => x.id !== r.id)
  } catch (e) {
    toast.error(apiMessage(e))
  }
}
const canModify = (r: Review) => isAdmin.value || (!!user.value && r.user?.id === user.value.id)

useSeoMeta({
  title: () => dish.value?.name ?? 'Plat',
  description: () => `${dish.value?.description ?? ''} ${formatPrice(dish.value?.price)} chez ${restaurant.name}.`,
  ogImage: () => imageUrl(dish.value?.image_url) ?? `${restaurant.siteUrl}/images/restaurant.jpg`,
})
useHead(() => ({
  script: dish.value ? [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'MenuItem',
      name: dish.value.name,
      description: dish.value.description,
      ...(dish.value.image_url ? { image: imageUrl(dish.value.image_url) } : {}),
      offers: { '@type': 'Offer', price: Number(dish.value.price).toFixed(2), priceCurrency: 'EUR' },
    }),
  }] : [],
}))
</script>

<template>
  <div v-if="dish" class="container-x max-w-5xl py-10">
    <NuxtLink to="/carte" class="inline-flex items-center gap-2 text-gray-300 hover:text-brand"><Icon name="back" :size="16" /> Retour au menu</NuxtLink>

    <div class="card mt-6 grid overflow-hidden md:grid-cols-2">
      <div class="h-72 md:h-full md:min-h-96">
        <DishImage :src="dish.image_url" :alt="dish.name" eager />
      </div>
      <div class="flex flex-col p-6 sm:p-8">
        <p v-if="dish.category" class="text-sm text-gray-300">{{ dish.category.title }}</p>
        <h1 class="mt-1 text-3xl font-bold sm:text-4xl">{{ dish.name }}</h1>
        <p class="mt-3 text-2xl font-bold text-brand">{{ formatPrice(dish.price) }}</p>
        <p class="mt-4 whitespace-pre-line leading-relaxed text-gray-100">{{ dish.description }}</p>
        <div class="mt-auto flex flex-wrap items-center gap-3 pt-8">
          <QuantityStepper v-model="quantity" />
          <button class="btn-add flex-1 !rounded-lg !py-3 text-lg" :disabled="adding" :aria-label="`Ajouter ${dish.name} au panier`" @click="add">
            <Icon name="bag" :size="20" /> {{ formatPrice(Number(dish.price) * quantity) }}
          </button>
        </div>
      </div>
    </div>

    <section class="mt-12" aria-labelledby="avis">
      <h2 id="avis" class="text-2xl font-bold">Commentaires <span class="text-base font-normal text-gray-400">({{ reviews.length }})</span></h2>

      <ClientOnly>
        <form v-if="loggedIn" class="mt-4" @submit.prevent="postReview">
          <label class="sr-only" for="review">Votre commentaire</label>
          <textarea id="review" v-model="draft" class="field min-h-24 resize-y" maxlength="1000" placeholder="Votre avis sur ce plat" />
          <div class="mt-2 flex items-center justify-between">
            <span class="text-xs text-gray-400">{{ draft.length }}/1000</span>
            <button class="btn-primary" :disabled="posting || !draft.trim()">Publier</button>
          </div>
        </form>
        <button v-else class="btn-ghost mt-4" @click="loginOpen = true">Connectez-vous pour laisser un commentaire</button>
      </ClientOnly>

      <ul class="mt-6 space-y-4">
        <li v-for="r in reviews" :key="r.id" class="card p-4">
          <div class="flex items-center gap-3">
            <span class="grid h-10 w-10 place-items-center rounded-full bg-brand text-sm font-bold">{{ initials(r.user?.name) }}</span>
            <div class="flex-1">
              <p class="font-semibold">{{ r.user?.name || 'Client' }}</p>
              <p class="text-xs text-gray-300">{{ formatDate(r.createdAt, { dateStyle: 'medium' }) }}</p>
            </div>
            <div v-if="canModify(r)" class="flex gap-1">
              <button class="rounded-full p-2 hover:bg-white/10" aria-label="Modifier" @click="editing = r.id; editText = r.content"><Icon name="edit" :size="15" /></button>
              <button class="rounded-full p-2 text-red-300 hover:bg-white/10" aria-label="Supprimer" @click="removeReview(r)"><Icon name="trash" :size="15" /></button>
            </div>
          </div>
          <div v-if="editing === r.id" class="mt-3">
            <textarea v-model="editText" class="field min-h-20" maxlength="1000" />
            <div class="mt-2 flex justify-end gap-2">
              <button class="btn-ghost" @click="editing = null">Annuler</button>
              <button class="btn-primary" @click="saveEdit(r)">Enregistrer</button>
            </div>
          </div>
          <p v-else class="mt-3 whitespace-pre-line">{{ r.content }}</p>
        </li>
        <li v-if="!reviews.length" class="text-gray-300">Aucun commentaire pour l’instant.</li>
      </ul>
    </section>
  </div>
</template>
