<script setup lang="ts">
const consent = useConsent()
onMounted(() => consent.init())
</script>

<template>
  <Transition name="fade">
    <div v-if="consent.bannerOpen.value" class="no-print fixed bottom-4 left-4 z-[55] max-w-sm rounded-3xl border border-ink/10 bg-white p-5 shadow-2xl" role="dialog" aria-label="Cookies">
      <p class="font-display text-lg font-semibold">Un cookie ? 🍪</p>
      <p class="mt-1 text-sm text-muted">
        Nous mesurons l'audience du site (Google Analytics) uniquement si vous l'acceptez. Les cookies nécessaires au panier et à la connexion restent actifs.
        <NuxtLink to="/confidentialite" class="font-semibold text-ink underline">En savoir plus</NuxtLink>
      </p>
      <div class="mt-4 flex gap-2">
        <button class="btn-ghost flex-1 !py-2.5" @click="consent.refuse()">Refuser</button>
        <button class="btn-dark flex-1 !py-2.5" @click="consent.accept()">Accepter</button>
      </div>
    </div>
  </Transition>
</template>
