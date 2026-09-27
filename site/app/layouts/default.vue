<template>
  <div class="flex min-h-dvh flex-col">
    <a href="#contenu" class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded focus:bg-brand focus:px-4 focus:py-2">Aller au contenu</a>
    <SiteHeader />
    <main id="contenu" class="flex-1 overflow-x-clip">
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
