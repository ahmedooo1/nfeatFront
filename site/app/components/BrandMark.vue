<script setup lang="ts">
import { restaurant } from '~/restaurant.config'
defineProps<{ light?: boolean }>()
</script>

<template>
  <NuxtLink to="/" class="group inline-flex items-center gap-2.5" :aria-label="`${restaurant.name}, accueil`">
    <span class="grid h-10 w-10 place-items-center rounded-2xl transition group-hover:rotate-[-6deg]" :class="light ? 'bg-cream text-ink' : 'bg-ink text-cream'">
      <svg viewBox="0 0 64 64" class="h-7 w-7" aria-hidden="true">
        <path d="M18 40c-5-1-8-5-7-10 1-4 5-7 9-6 1-6 6-10 12-10s11 4 12 10c4-1 8 2 9 6 1 5-2 9-7 10v6H18z" fill="currentColor" />
        <path d="M18 43h28v5H18z" fill="#e0512a" />
      </svg>
    </span>
    <span class="leading-none">
      <span class="block font-display text-xl font-extrabold tracking-tight" :class="light ? 'text-cream' : 'text-ink'">{{ restaurant.name }}</span>
      <span class="block text-[10px] font-bold uppercase tracking-[.28em]" :class="light ? 'text-cream/60' : 'text-muted'">{{ restaurant.fullName }}</span>
    </span>
  </NuxtLink>
</template>
