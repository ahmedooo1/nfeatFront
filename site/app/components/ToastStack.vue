<script setup lang="ts">
const { toasts, dismiss } = useToast()
const tone = { success: 'bg-green-600', error: 'bg-red-600', info: 'bg-gray-700' } as const
</script>

<template>
  <div class="no-print pointer-events-none fixed inset-x-0 top-20 z-[60] flex flex-col items-center gap-2 px-4" aria-live="polite">
    <TransitionGroup name="fade">
      <div v-for="t in toasts" :key="t.id" class="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-lg px-4 py-3 text-sm text-white shadow-xl" :class="tone[t.tone]">
        <span class="flex-1">{{ t.message }}</span>
        <NuxtLink v-if="t.action" :to="t.action.to" class="font-bold underline" @click="dismiss(t.id)">{{ t.action.label }}</NuxtLink>
        <button class="opacity-70 hover:opacity-100" aria-label="Fermer" @click="dismiss(t.id)"><Icon name="x" :size="16" /></button>
      </div>
    </TransitionGroup>
  </div>
</template>
