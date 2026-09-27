<script setup lang="ts">
import type { NuxtError } from '#app'
const props = defineProps<{ error: NuxtError }>()
const notFound = computed(() => props.error.statusCode === 404)
useSeoMeta({ title: notFound.value ? 'Page introuvable' : 'Erreur', robots: 'noindex' })
</script>

<template>
  <NuxtLayout>
    <div class="container-x grid min-h-[70vh] place-items-center py-20 text-center">
      <div>
        <p class="text-8xl font-bold leading-none text-brand">{{ error.statusCode }}</p>
        <h1 class="text-4xl font-semibold">{{ notFound ? 'Page introuvable' : 'Une erreur est survenue' }}</h1>
        <p class="mt-3 text-gray-300">{{ notFound ? 'Cette page n’existe pas ou plus.' : 'Réessayez dans un instant.' }}</p>
        <div class="mt-8 flex justify-center gap-3">
          <button class="btn-primary" @click="clearError({ redirect: '/carte' })">Voir le menu</button>
          <button class="btn-ghost" @click="clearError({ redirect: '/' })">Accueil</button>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>
