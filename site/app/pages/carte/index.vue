<script setup lang="ts">
import { restaurant } from '~/restaurant.config'

definePageMeta({ alias: ['/menus'] })
useSeoMeta({ title: 'Menu', description: `Le menu de ${restaurant.name} : commandez en ligne et récupérez vos plats au restaurant.` })

const { dishes, categories, pending, error, refresh } = await useMenu()
const query = ref('')
const category = ref<number | null>(null)

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return dishes.value.filter((d) =>
    (category.value === null || d.category?.id === category.value)
    && (!q || `${d.name} ${d.description}`.toLowerCase().includes(q)),
  )
})
</script>

<template>
  <div class="container-x py-12">
    <div class="text-center"><h1 class="brush-title">Articles du menu</h1></div>

    <div class="mt-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-none" role="tablist" aria-label="Catégories">
        <button class="shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition" :class="category === null ? 'bg-brand' : 'bg-tile hover:bg-gray-500'" @click="category = null">Toutes les catégories</button>
        <button v-for="c in categories" :key="c.id" class="shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition" :class="category === c.id ? 'bg-brand' : 'bg-tile hover:bg-gray-500'" @click="category = c.id">{{ c.title }}</button>
      </div>
      <label class="relative md:w-72">
        <span class="sr-only">Rechercher un plat</span>
        <Icon name="search" :size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input v-model="query" type="search" class="field !pl-10" placeholder="Rechercher un plat">
      </label>
    </div>

    <div v-if="pending && !dishes.length" class="mt-8 grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      <div v-for="i in 8" :key="i" class="skeleton h-80" />
    </div>
    <div v-else-if="error && !dishes.length" class="card mx-auto mt-10 max-w-md p-8 text-center">
      <p>Le menu n’a pas pu être chargé.</p>
      <button class="btn-primary mt-4" @click="refresh()">Réessayer</button>
    </div>
    <p v-else-if="!filtered.length" class="mt-16 text-center text-gray-300">Aucun plat ne correspond à votre recherche.</p>
    <div v-else class="mt-8 grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      <DishCard v-for="(d, i) in filtered" :key="d.id" :dish="d" :eager="i < 4" />
    </div>
  </div>
</template>
