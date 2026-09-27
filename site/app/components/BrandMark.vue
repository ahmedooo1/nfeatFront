<script setup lang="ts">
import { restaurant } from '~/restaurant.config'
withDefaults(defineProps<{ size?: string }>(), { size: 'w-20' })
</script>

<template>
  <NuxtLink to="/" :aria-label="`${restaurant.name}, accueil`" class="inline-block">
    <img src="/images/logo.png" :alt="`Logo ${restaurant.name}`" :class="size" width="353" height="331">
  </NuxtLink>
</template>
