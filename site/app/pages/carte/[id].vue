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
    toast.success('Merci pour votre avis !')
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
  if (!confirm('Supprimer cet avis ?')) return
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
  description: () => `${dish.value?.description ?? ''} · ${formatPrice(dish.value?.price)} chez ${restaurant.name}.`,
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
  <div v-if="dish" class="container-x py-10 sm:py-14">
    <NuxtLink to="/carte" class="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink"><Icon name="back" :size="16" /> Retour à la carte</NuxtLink>

    <div class="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-16">
      <div class="relative">
        <div class="arch aspect-[4/5] shadow-2xl lg:sticky lg:top-28">
          <DishImage :src="dish.image_url" :alt="dish.name" :category="dish.category?.title" eager />
        </div>
      </div>

      <div class="lg:py-6">
        <p v-if="dish.category" class="eyebrow">{{ dish.category.title }}</p>
        <h1 class="mt-3 font-display text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl">{{ dish.name }}</h1>
        <p class="mt-5 font-display text-4xl font-bold text-ember">{{ formatPrice(dish.price) }}</p>
        <p class="mt-6 whitespace-pre-line text-lg leading-relaxed text-muted">{{ dish.description }}</p>

        <div class="card mt-8 flex flex-wrap items-center gap-4 p-4">
          <QuantityStepper v-model="quantity" />
          <button class="btn-primary flex-1 !py-4 text-base" :disabled="adding" @click="add">
            <Icon name="bag" :size="18" /> Ajouter · {{ formatPrice(Number(dish.price) * quantity) }}
          </button>
        </div>
        <ul class="mt-6 grid gap-3 text-sm text-muted sm:grid-cols-2">
          <li class="flex items-center gap-2"><Icon name="clock" :size="16" class="text-ember" /> Prêt en ~{{ restaurant.pickupMinutes }} minutes</li>
          <li class="flex items-center gap-2"><Icon name="leaf" :size="16" class="text-ember" /> Préparé à la commande</li>
        </ul>

        <!-- Avis -->
        <section class="mt-14" aria-labelledby="avis">
          <div class="flex items-baseline justify-between">
            <h2 id="avis" class="font-display text-3xl font-semibold">Avis</h2>
            <span class="text-sm text-muted">{{ reviews.length }} avis</span>
          </div>

          <ClientOnly>
            <form v-if="loggedIn" class="mt-5" @submit.prevent="postReview">
              <label class="label" for="review">Votre avis</label>
              <textarea id="review" v-model="draft" class="field min-h-24 resize-y" maxlength="1000" placeholder="Qu’avez-vous pensé de ce plat ?" />
              <div class="mt-2 flex items-center justify-between">
                <span class="text-xs text-muted">{{ draft.length }}/1000</span>
                <button class="btn-dark !py-2.5" :disabled="posting || !draft.trim()">Publier</button>
              </div>
            </form>
            <button v-else class="btn-ghost mt-5 w-full" @click="loginOpen = true">Connectez-vous pour laisser un avis</button>
          </ClientOnly>

          <ul class="mt-6 space-y-4">
            <li v-for="r in reviews" :key="r.id" class="card p-5">
              <div class="flex items-center gap-3">
                <span class="grid h-10 w-10 place-items-center rounded-full bg-saffron/30 text-sm font-extrabold">{{ initials(r.user?.name) }}</span>
                <div class="flex-1">
                  <p class="font-semibold">{{ r.user?.name || 'Client' }}</p>
                  <p class="text-xs text-muted">{{ formatDate(r.createdAt, { dateStyle: 'medium' }) }}</p>
                </div>
                <div v-if="canModify(r)" class="flex gap-1">
                  <button class="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-cream hover:text-ink" aria-label="Modifier" @click="editing = r.id; editText = r.content"><Icon name="edit" :size="15" /></button>
                  <button class="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-ember/10 hover:text-ember" aria-label="Supprimer" @click="removeReview(r)"><Icon name="trash" :size="15" /></button>
                </div>
              </div>
              <div v-if="editing === r.id" class="mt-3">
                <textarea v-model="editText" class="field min-h-20" maxlength="1000" />
                <div class="mt-2 flex justify-end gap-2">
                  <button class="btn-ghost !py-2" @click="editing = null">Annuler</button>
                  <button class="btn-dark !py-2" @click="saveEdit(r)">Enregistrer</button>
                </div>
              </div>
              <p v-else class="mt-3 whitespace-pre-line text-ink/85">{{ r.content }}</p>
            </li>
            <li v-if="!reviews.length" class="rounded-3xl border border-dashed border-ink/15 p-8 text-center text-muted">Soyez le premier à donner votre avis.</li>
          </ul>
        </section>
      </div>
    </div>
  </div>
</template>
