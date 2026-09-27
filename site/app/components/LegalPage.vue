<script setup lang="ts">
defineProps<{ title: string; updated?: string }>()
</script>

<template>
  <div class="container-x max-w-3xl py-12 sm:py-16">
    <h1 class="text-3xl font-bold sm:text-4xl">{{ title }}</h1>
    <p v-if="updated" class="mt-2 text-sm text-gray-300">Mise à jour : {{ updated }}</p>
    <div class="legal mt-10 space-y-8 text-gray-100 [&_h2]:[&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-white [&_p]:mt-3 [&_p]:leading-relaxed [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
      <slot />
    </div>
  </div>
</template>
