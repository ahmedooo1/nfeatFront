<script setup lang="ts">
const props = defineProps<{ src?: string | null; alt: string; category?: string; eager?: boolean }>()
const failed = ref(false)
const url = computed(() => (failed.value ? null : imageUrl(props.src)))
const emoji = computed(() => dishEmoji(`${props.alt} ${props.category ?? ''}`))
</script>

<template>
  <div class="@container relative h-full w-full overflow-hidden bg-gradient-to-br from-cream-2 via-sand/60 to-saffron/30">
    <img
      v-if="url"
      :src="url"
      :alt="alt"
      :loading="eager ? 'eager' : 'lazy'"
      decoding="async"
      class="h-full w-full object-cover transition duration-700 group-hover:scale-105"
      @error="failed = true"
    >
    <div v-else class="grid h-full w-full place-items-center bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,.7),transparent_60%)]">
      <span class="text-[clamp(1.75rem,34cqw,9rem)] drop-shadow-[0_12px_18px_rgba(22,17,13,.18)] transition duration-500 group-hover:scale-110 group-hover:rotate-[-6deg]" aria-hidden="true">{{ emoji }}</span>
    </div>
  </div>
</template>
