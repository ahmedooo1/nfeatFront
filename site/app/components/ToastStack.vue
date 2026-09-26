<script setup lang="ts">
const { toasts, dismiss } = useToast()
const icon = { success: 'check', error: 'x', info: 'sparkle' } as const
</script>

<template>
  <div class="no-print pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 sm:bottom-6" aria-live="polite">
    <TransitionGroup name="fade">
      <div v-for="t in toasts" :key="t.id" class="pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-2xl bg-ink px-4 py-3 text-sm text-cream shadow-2xl">
        <span class="grid h-7 w-7 shrink-0 place-items-center rounded-full" :class="t.tone === 'error' ? 'bg-ember' : t.tone === 'success' ? 'bg-olive' : 'bg-saffron text-ink'">
          <Icon :name="icon[t.tone]" :size="15" :stroke="2.4" />
        </span>
        <span class="flex-1">{{ t.message }}</span>
        <NuxtLink v-if="t.action" :to="t.action.to" class="font-bold text-saffron hover:underline" @click="dismiss(t.id)">{{ t.action.label }}</NuxtLink>
        <button class="text-cream/50 hover:text-cream" aria-label="Fermer" @click="dismiss(t.id)"><Icon name="x" :size="16" /></button>
      </div>
    </TransitionGroup>
  </div>
</template>
