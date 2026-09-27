<script setup lang="ts">
const model = defineModel<number>({ required: true })
withDefaults(defineProps<{ min?: number; max?: number }>(), { min: 1, max: 50 })
</script>

<template>
  <div class="inline-flex items-center gap-1 rounded-full bg-gray-700 p-1">
    <button type="button" class="grid h-8 w-8 place-items-center rounded-full hover:bg-white/10 disabled:opacity-30" :disabled="model <= min" aria-label="Retirer un" @click="model = Math.max(min, model - 1)"><Icon name="minus" :size="15" /></button>
    <span class="min-w-6 text-center font-semibold tabular-nums" aria-live="polite">{{ model }}</span>
    <button type="button" class="grid h-8 w-8 place-items-center rounded-full hover:bg-white/10 disabled:opacity-30" :disabled="model >= max" aria-label="Ajouter un" @click="model = Math.min(max, model + 1)"><Icon name="plus" :size="15" /></button>
  </div>
</template>
