<script setup lang="ts">
const { user, logout } = useAuth()
const nav = [
  { to: '/admin', label: 'Tableau de bord', icon: 'chart', exact: true },
  { to: '/admin/commandes', label: 'Commandes', icon: 'receipt' },
  { to: '/admin/carte', label: 'La carte', icon: 'edit' },
  { to: '/admin/utilisateurs', label: 'Clients', icon: 'users' },
]
const route = useRoute()
const isActive = (item: { to: string; exact?: boolean }) => (item.exact ? route.path === item.to : route.path.startsWith(item.to))
</script>

<template>
  <div class="min-h-dvh bg-night lg:grid lg:grid-cols-[260px_1fr]">
    <aside class="bg-gray-900 text-white">
      <div class="lg:sticky lg:top-0 lg:h-dvh">
      <div class="flex items-center justify-between px-6 py-5 lg:block">
        <BrandMark light />
      </div>
      <nav class="flex gap-1 overflow-x-auto px-3 pb-3 scrollbar-none lg:flex-col lg:px-4" aria-label="Administration">
        <NuxtLink
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          class="flex shrink-0 items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition"
          :class="isActive(item) ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'"
        >
          <Icon :name="item.icon" :size="18" /> {{ item.label }}
        </NuxtLink>
      </nav>
      <div class="hidden border-t border-white/10 p-4 lg:absolute lg:inset-x-0 lg:bottom-0 lg:block">
        <NuxtLink to="/" class="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-gray-400 hover:text-white"><Icon name="back" :size="18" /> Voir le site</NuxtLink>
        <button class="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm text-gray-400 hover:text-white" @click="logout"><Icon name="logout" :size="18" /> {{ user?.name }}</button>
      </div>
      </div>
    </aside>
    <main class="min-w-0 p-4 sm:p-8">
      <slot />
    </main>
    <ToastStack />
  </div>
</template>
