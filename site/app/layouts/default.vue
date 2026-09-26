<script setup lang="ts">
const route = useRoute()
const isHome = computed(() => route.path === '/')
</script>

<template>
  <div class="flex min-h-dvh flex-col">
    <a href="#contenu" class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-cream">Aller au contenu</a>
    <SiteHeader />
    <main id="contenu" class="flex-1" :class="isHome ? '' : 'pt-[72px]'">
      <slot />
    </main>
    <SiteFooter />
    <ClientOnly>
      <CartDrawer />
      <AuthModal />
      <AssistantWidget />
      <CookieBanner />
    </ClientOnly>
    <ToastStack />
  </div>
</template>
