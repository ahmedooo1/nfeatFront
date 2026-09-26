<script setup lang="ts">
defineProps<{ title: string; updated?: string }>()
</script>

<template>
  <div class="container-x max-w-3xl py-12 sm:py-16">
    <h1 class="font-display text-5xl font-semibold tracking-tight">{{ title }}</h1>
    <p v-if="updated" class="mt-2 text-sm text-muted">Mise à jour : {{ updated }}</p>
    <div class="legal mt-10 space-y-8 text-ink/85 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-ink [&_p]:mt-3 [&_p]:leading-relaxed [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
      <slot />
    </div>
  </div>
</template>
