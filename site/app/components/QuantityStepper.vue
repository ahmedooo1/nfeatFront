<script setup lang="ts">
const model = defineModel<number>({ required: true })
withDefaults(defineProps<{ min?: number; max?: number; size?: 'sm' | 'md' }>(), { min: 1, max: 50, size: 'md' })
</script>

<template>
  <div class="inline-flex items-center rounded-full border border-ink/10 bg-white p-1" :class="size === 'sm' ? 'gap-1' : 'gap-2'">
    <button type="button" class="grid place-items-center rounded-full transition hover:bg-cream disabled:opacity-30" :class="size === 'sm' ? 'h-7 w-7' : 'h-9 w-9'" :disabled="model <= min" aria-label="Retirer un" @click="model = Math.max(min, model - 1)">
      <Icon name="minus" :size="size === 'sm' ? 14 : 16" />
    </button>
    <span class="min-w-6 text-center font-bold tabular-nums" :class="size === 'sm' ? 'text-sm' : ''" aria-live="polite">{{ model }}</span>
    <button type="button" class="grid place-items-center rounded-full transition hover:bg-cream disabled:opacity-30" :class="size === 'sm' ? 'h-7 w-7' : 'h-9 w-9'" :disabled="model >= max" aria-label="Ajouter un" @click="model = Math.min(max, model + 1)">
      <Icon name="plus" :size="size === 'sm' ? 14 : 16" />
    </button>
  </div>
</template>
