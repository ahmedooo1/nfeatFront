<script setup lang="ts">
const consent = useConsent()
onMounted(() => consent.init())
</script>

<template>
  <Transition name="fade">
    <div v-if="consent.bannerOpen.value" class="no-print fixed inset-x-4 bottom-4 z-[55] mx-auto flex max-w-3xl flex-col gap-4 rounded-lg bg-gray-900 p-5 shadow-2xl sm:flex-row sm:items-center" role="dialog" aria-label="Cookies">
      <p class="flex-1 text-sm text-gray-200">
        Ce site utilise des cookies pour mesurer l’audience, uniquement si vous l’acceptez.
        <NuxtLink to="/confidentialite" class="underline">Politique de gestion des cookies</NuxtLink>
      </p>
      <div class="flex gap-2">
        <button class="rounded bg-green-500 px-4 py-2 font-semibold hover:bg-green-600" @click="consent.accept()">Accepter</button>
        <button class="rounded bg-red-500 px-4 py-2 font-semibold hover:bg-red-600" @click="consent.refuse()">Refuser</button>
      </div>
    </div>
  </Transition>
</template>
