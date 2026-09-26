<script setup lang="ts">
const { loggedIn, isAdmin, user, logout, loginOpen } = useAuth()
const cart = useCart()
const route = useRoute()
const mobileOpen = ref(false)
const accountOpen = ref(false)
const scrolled = ref(false)

// Sur l'accueil, l'en-tête est transparent au-dessus de la photo.
const overHero = computed(() => route.path === '/' && !scrolled.value)

const links = [
  { to: '/carte', label: 'La carte' },
  { to: '/a-propos', label: 'Notre histoire' },
  { to: '/contact', label: 'Contact' },
]

onMounted(() => {
  const onScroll = () => (scrolled.value = window.scrollY > 24)
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
})
watch(() => route.fullPath, () => {
  mobileOpen.value = false
  accountOpen.value = false
})
</script>

<template>
  <header
    class="no-print fixed inset-x-0 top-0 z-40 transition-all duration-300"
    :class="overHero ? 'bg-transparent' : 'border-b border-ink/5 bg-cream/85 backdrop-blur-xl'"
  >
    <div class="container-x flex h-[72px] items-center justify-between gap-4">
      <BrandMark :light="overHero" />

      <nav class="hidden items-center gap-1 md:flex" aria-label="Navigation principale">
        <NuxtLink
          v-for="l in links"
          :key="l.to"
          :to="l.to"
          class="rounded-full px-4 py-2 text-sm font-semibold transition"
          :class="overHero ? 'text-cream/85 hover:bg-white/10 hover:text-white' : 'text-ink/75 hover:bg-ink/5 hover:text-ink'"
          active-class="!text-ember"
        >
          {{ l.label }}
        </NuxtLink>
        <NuxtLink v-if="isAdmin" to="/admin" class="rounded-full px-4 py-2 text-sm font-semibold text-ember hover:bg-ember/10">Espace pro</NuxtLink>
      </nav>

      <div class="flex items-center gap-2">
        <ClientOnly>
          <div v-if="loggedIn" class="relative hidden sm:block">
            <button class="flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3 text-sm font-semibold transition" :class="overHero ? 'text-cream hover:bg-white/10' : 'hover:bg-ink/5'" @click="accountOpen = !accountOpen">
              <span class="grid h-8 w-8 place-items-center overflow-hidden rounded-full bg-saffron text-xs font-extrabold text-ink">
                <img v-if="user?.picture" :src="`data:image/jpeg;base64,${user.picture}`" alt="" class="h-full w-full object-cover">
                <template v-else>{{ initials(user?.name) }}</template>
              </span>
              <span class="max-w-28 truncate">{{ user?.name?.split(' ')[0] }}</span>
            </button>
            <Transition name="fade">
              <div v-if="accountOpen" class="card absolute right-0 mt-2 w-56 overflow-hidden p-1.5 text-sm" @mouseleave="accountOpen = false">
                <NuxtLink to="/compte" class="flex items-center gap-3 rounded-2xl px-3 py-2.5 hover:bg-cream"><Icon name="user" :size="16" /> Mon compte</NuxtLink>
                <NuxtLink to="/compte/commandes" class="flex items-center gap-3 rounded-2xl px-3 py-2.5 hover:bg-cream"><Icon name="receipt" :size="16" /> Mes commandes</NuxtLink>
                <NuxtLink v-if="isAdmin" to="/admin" class="flex items-center gap-3 rounded-2xl px-3 py-2.5 hover:bg-cream"><Icon name="chart" :size="16" /> Espace pro</NuxtLink>
                <button class="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-ember-dark hover:bg-ember/5" @click="logout"><Icon name="logout" :size="16" /> Se déconnecter</button>
              </div>
            </Transition>
          </div>
          <button v-else class="hidden rounded-full px-4 py-2 text-sm font-semibold transition sm:block" :class="overHero ? 'text-cream hover:bg-white/10' : 'hover:bg-ink/5'" @click="loginOpen = true">
            Se connecter
          </button>

          <button
            class="relative grid h-11 w-11 place-items-center rounded-full transition"
            :class="overHero ? 'bg-white/10 text-cream hover:bg-white/20' : 'bg-ink text-cream hover:bg-ink-3'"
            :aria-label="`Panier, ${cart.count.value} article(s)`"
            @click="cart.open.value = true"
          >
            <Icon name="bag" />
            <span v-if="cart.count.value" class="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-ember px-1 text-[11px] font-extrabold text-white ring-2 ring-cream">
              {{ cart.count.value }}
            </span>
          </button>
        </ClientOnly>

        <button class="grid h-11 w-11 place-items-center rounded-full md:hidden" :class="overHero ? 'text-cream' : 'text-ink'" aria-label="Menu" @click="mobileOpen = !mobileOpen">
          <Icon :name="mobileOpen ? 'x' : 'menu'" />
        </button>
      </div>
    </div>

    <Transition name="fade">
      <div v-if="mobileOpen" class="border-t border-ink/5 bg-cream px-4 pb-6 pt-2 md:hidden">
        <NuxtLink v-for="l in links" :key="l.to" :to="l.to" class="block rounded-2xl px-4 py-3 font-display text-2xl font-semibold">{{ l.label }}</NuxtLink>
        <ClientOnly>
          <div class="mt-3 grid gap-2 border-t border-ink/10 pt-4">
            <template v-if="loggedIn">
              <NuxtLink to="/compte" class="btn-ghost">Mon compte</NuxtLink>
              <NuxtLink v-if="isAdmin" to="/admin" class="btn-ghost">Espace pro</NuxtLink>
              <button class="btn-ghost" @click="logout">Se déconnecter</button>
            </template>
            <button v-else class="btn-dark" @click="loginOpen = true; mobileOpen = false">Se connecter</button>
          </div>
        </ClientOnly>
      </div>
    </Transition>
  </header>
</template>
