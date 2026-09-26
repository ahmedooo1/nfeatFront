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
        <p class="font-display text-[8rem] font-bold leading-none text-ember/20">{{ error.statusCode }}</p>
        <h1 class="font-display text-4xl font-semibold">{{ notFound ? 'Cette page s’est fait manger.' : 'Oups, un souci en cuisine.' }}</h1>
        <p class="mt-3 text-muted">{{ notFound ? 'Elle n’existe pas ou plus. La carte, elle, est toujours là.' : 'Réessayez dans un instant.' }}</p>
        <div class="mt-8 flex justify-center gap-3">
          <button class="btn-dark" @click="clearError({ redirect: '/carte' })">Voir la carte</button>
          <button class="btn-ghost" @click="clearError({ redirect: '/' })">Accueil</button>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>
