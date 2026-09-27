<script setup lang="ts">
const { loggedIn, isAdmin, logout, loginOpen } = useAuth()
const cart = useCart()
const route = useRoute()
const open = ref(false)

const links = [
  { to: '/', label: 'Accueil', icon: 'home' },
  { to: '/carte', label: 'Menus', icon: 'list' },
  { to: '/a-propos', label: 'À propos', icon: 'info' },
  { to: '/contact', label: 'Contact', icon: 'mail' },
]
watch(() => route.fullPath, () => (open.value = false))
</script>

<template>
  <header class="no-print sticky top-0 z-40 bg-night/95 backdrop-blur">
    <div class="container-x flex items-center justify-between py-3">
      <BrandMark size="w-16 sm:w-20" />

      <nav class="hidden items-center gap-1 md:flex" aria-label="Navigation principale">
        <NuxtLink v-for="l in links" :key="l.to" :to="l.to" class="flex items-center gap-2 rounded-full px-3 py-2 hover:text-brand" exact-active-class="text-brand">
          <Icon :name="l.icon" :size="18" /> {{ l.label }}
        </NuxtLink>
      </nav>

      <div class="flex items-center gap-2">
        <ClientOnly>
          <template v-if="loggedIn">
            <NuxtLink v-if="isAdmin" to="/admin" class="hidden items-center gap-2 rounded-full px-3 py-2 hover:text-brand sm:flex"><Icon name="chart" :size="18" /> Admin</NuxtLink>
            <NuxtLink to="/compte" class="hidden items-center gap-2 rounded-full px-3 py-2 hover:text-brand sm:flex"><Icon name="user" :size="18" /> Espace Personnel</NuxtLink>
            <button class="hidden rounded-full bg-red-500 p-2 hover:bg-red-600 sm:block" title="Déconnexion" aria-label="Déconnexion" @click="logout"><Icon name="logout" :size="16" /></button>
          </template>
          <button v-else class="hidden items-center gap-2 rounded-full px-3 py-2 hover:text-brand sm:flex" @click="loginOpen = true">
            <Icon name="user" :size="18" /> Espace Personnel
          </button>
          <button class="relative rounded-full p-2 hover:text-brand" :aria-label="`Panier, ${cart.count.value} article(s)`" @click="cart.open.value = true">
            <Icon name="bag" :size="24" />
            <span v-if="cart.count.value" class="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-red-600 px-1 text-[11px] font-bold">{{ cart.count.value }}</span>
          </button>
        </ClientOnly>
        <button class="p-2 md:hidden" aria-label="Menu" @click="open = !open"><Icon :name="open ? 'x' : 'menu'" :size="26" /></button>
      </div>
    </div>

    <Transition name="fade">
      <nav v-if="open" class="rounded-b-3xl bg-night px-4 pb-5 md:hidden" aria-label="Navigation mobile">
        <NuxtLink v-for="l in links" :key="l.to" :to="l.to" class="flex items-center gap-3 rounded-lg px-3 py-3 hover:bg-white/5"><Icon :name="l.icon" :size="18" /> {{ l.label }}</NuxtLink>
        <ClientOnly>
          <template v-if="loggedIn">
            <NuxtLink to="/compte" class="flex items-center gap-3 rounded-lg px-3 py-3 hover:bg-white/5"><Icon name="user" :size="18" /> Espace Personnel</NuxtLink>
            <NuxtLink v-if="isAdmin" to="/admin" class="flex items-center gap-3 rounded-lg px-3 py-3 hover:bg-white/5"><Icon name="chart" :size="18" /> Admin</NuxtLink>
            <button class="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-red-400 hover:bg-white/5" @click="logout"><Icon name="logout" :size="18" /> Déconnexion</button>
          </template>
          <button v-else class="flex w-full items-center gap-3 rounded-lg px-3 py-3 hover:bg-white/5" @click="loginOpen = true; open = false"><Icon name="user" :size="18" /> Espace Personnel</button>
        </ClientOnly>
      </nav>
    </Transition>
  </header>
</template>
