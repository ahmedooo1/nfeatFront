<script setup lang="ts">
import { restaurant } from '~/restaurant.config'

definePageMeta({ alias: ['/menus'] })
useSeoMeta({
  title: 'La carte',
  description: `Découvrez la carte de ${restaurant.name} : ${restaurant.cuisine.join(', ').toLowerCase()}. Commandez en ligne et récupérez en ~${restaurant.pickupMinutes} minutes.`,
})

const { dishes, categories, pending, error, refresh } = await useMenu()
const query = ref('')
const active = ref<number | null>(null)

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return dishes.value
  return dishes.value.filter((d) => `${d.name} ${d.description} ${d.category?.title ?? ''}`.toLowerCase().includes(q))
})
const sections = computed(() => {
  const groups = categories.value
    .map((c) => ({ ...c, dishes: filtered.value.filter((d) => d.category?.id === c.id) }))
    .filter((g) => g.dishes.length)
  const orphans = filtered.value.filter((d) => !d.category || !categories.value.some((c) => c.id === d.category?.id))
  if (orphans.length) groups.push({ id: 0, title: 'Autres', content: '', dishes: orphans })
  return groups
})

function jump(id: number) {
  active.value = id
  document.getElementById(`cat-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

onMounted(() => {
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.isIntersecting && (active.value = Number(e.target.id.replace('cat-', '')))),
    { rootMargin: '-45% 0px -50% 0px' },
  )
  watch(sections, async () => {
    await nextTick()
    io.disconnect()
    document.querySelectorAll('[id^="cat-"]').forEach((el) => io.observe(el))
  }, { immediate: true })
  onBeforeUnmount(() => io.disconnect())
})
</script>

<template>
  <div>
    <section class="relative overflow-hidden bg-ink py-16 text-cream grain sm:py-20">
      <div class="absolute -left-20 top-0 h-80 w-80 rounded-full bg-ember/30 blur-3xl" />
      <div class="container-x relative">
        <p class="eyebrow !text-saffron">Commande à emporter</p>
        <h1 class="mt-3 font-display text-5xl font-semibold tracking-tight sm:text-7xl">La carte</h1>
        <p class="mt-4 max-w-xl text-cream/70">Tout est préparé à la commande. Ajoutez vos plats, payez en ligne, on vous prévient quand c’est prêt.</p>
        <label class="relative mt-8 block max-w-lg">
          <span class="sr-only">Rechercher un plat</span>
          <Icon name="search" class="absolute left-4 top-1/2 -translate-y-1/2 text-muted" :size="18" />
          <input v-model="query" type="search" class="field !rounded-full !border-transparent !py-3.5 !pl-12" placeholder="Chawarma, falafel, dessert…">
        </label>
      </div>
    </section>

    <nav v-if="categories.length" class="sticky top-[72px] z-30 border-b border-ink/5 bg-cream/90 backdrop-blur-xl" aria-label="Catégories">
      <div class="container-x flex gap-2 overflow-x-auto py-3 scrollbar-none">
        <button
          v-for="s in sections"
          :key="s.id"
          class="shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition"
          :class="active === s.id ? 'bg-ink text-cream' : 'bg-white text-ink/70 hover:text-ink'"
          @click="jump(s.id)"
        >
          {{ s.title }} <span class="ml-1 opacity-50">{{ s.dishes.length }}</span>
        </button>
      </div>
    </nav>

    <div class="container-x py-12 sm:py-16">
      <div v-if="pending && !dishes.length" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="i in 6" :key="i" class="skeleton h-96" />
      </div>

      <div v-else-if="error && !dishes.length" class="card mx-auto max-w-md p-10 text-center">
        <p class="font-display text-2xl">La carte n’a pas pu être chargée.</p>
        <button class="btn-dark mt-6" @click="refresh()">Réessayer</button>
      </div>

      <div v-else-if="!sections.length" class="py-20 text-center">
        <p class="text-5xl">🔎</p>
        <p class="mt-4 font-display text-2xl">Aucun plat ne correspond à « {{ query }} »</p>
        <button class="btn-ghost mt-6" @click="query = ''">Effacer la recherche</button>
      </div>

      <section v-for="s in sections" :id="`cat-${s.id}`" :key="s.id" class="scroll-mt-40 pb-14">
        <div class="mb-6 flex items-baseline justify-between gap-4 border-b border-ink/10 pb-4">
          <h2 class="font-display text-3xl font-semibold sm:text-4xl">{{ s.title }}</h2>
          <span class="text-sm text-muted">{{ s.dishes.length }} plat{{ s.dishes.length > 1 ? 's' : '' }}</span>
        </div>
        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <DishCard v-for="(d, i) in s.dishes" :key="d.id" :dish="d" :eager="i < 3" />
        </div>
      </section>
    </div>
  </div>
</template>
