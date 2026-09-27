<script setup lang="ts">
const props = defineProps<{ src?: string | null; alt: string; eager?: boolean }>()
const failed = ref(false)
const url = computed(() => (failed.value ? null : imageUrl(props.src)))
</script>

<template>
  <img v-if="url" :src="url" :alt="alt" :loading="eager ? 'eager' : 'lazy'" decoding="async" class="h-full w-full object-cover" @error="failed = true">
  <div v-else class="grid h-full w-full place-items-center bg-gray-700">
    <img src="/images/logo.png" alt="" class="w-1/3 max-w-32 opacity-40">
  </div>
</template>
