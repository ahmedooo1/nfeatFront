<script setup lang="ts">
import { restaurant } from '~/restaurant.config'
const year = new Date().getFullYear()
const columns = [
  { title: 'Liens utiles', links: [{ to: '/contact', label: 'Contact' }, { to: '/', label: 'Accueil' }, { to: '/a-propos', label: 'À propos' }, { to: '/mentions-legales', label: 'Mentions légales' }] },
  { title: 'Utilisateurs', links: [{ to: '/carte', label: 'Menus' }, { to: '/compte', label: 'Espace Personnel' }, { to: '/confidentialite', label: 'Confidentialité' }] },
]
</script>

<template>
  <footer class="no-print mt-16 border-t border-white/10 bg-night pb-10 pt-16">
    <div class="container-x grid gap-10 text-center sm:grid-cols-2 sm:text-left lg:grid-cols-4">
      <div class="flex flex-col items-center sm:items-start">
        <BrandMark size="w-28" />
        <p class="mt-4 text-gray-300">{{ restaurant.description }}</p>
        <p v-if="restaurant.forSale.enabled" class="mt-4 text-sm text-gray-400">
          Pour avoir ce site ou d’autres sites, contactez-nous par mail :<br>
          <a :href="`mailto:${restaurant.forSale.contact}`" class="text-white underline hover:text-brand">{{ restaurant.forSale.contact }}</a>
        </p>
      </div>
      <nav v-for="c in columns" :key="c.title" :aria-label="c.title">
        <h3 class="mb-5 text-lg font-semibold">{{ c.title }}</h3>
        <ul class="space-y-3">
          <li v-for="l in c.links" :key="l.to"><NuxtLink :to="l.to" class="text-gray-300 hover:text-brand">{{ l.label }}</NuxtLink></li>
        </ul>
      </nav>
      <div>
        <h3 class="mb-5 text-lg font-semibold">Suivez-nous</h3>
        <div class="flex justify-center gap-3 sm:justify-start">
          <a v-for="(url, key) in restaurant.socials" :key="key" :href="url" target="_blank" rel="noopener" :aria-label="key" class="grid h-9 w-9 place-items-center rounded-full border border-white/40 hover:border-brand hover:text-brand">
            <Icon :name="key === 'tiktok' ? 'youtube' : key" :size="16" />
          </a>
        </div>
        <p class="mt-6 text-sm text-gray-300">Horaires</p>
        <p v-for="h in restaurant.hours" :key="h.label" class="text-sm text-gray-400">{{ h.label }} : {{ formatHour(h.open) }} - {{ formatHour(h.close) }}</p>
        <p class="mt-6 text-sm text-gray-400">© {{ year }} {{ restaurant.name }}</p>
        <button class="mt-1 text-sm text-gray-400 underline hover:text-white" @click="useConsent().reopen()">Gérer les cookies</button>
      </div>
    </div>
  </footer>
</template>
