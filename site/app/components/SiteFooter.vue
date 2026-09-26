<script setup lang="ts">
import { restaurant } from '~/restaurant.config'
const year = new Date().getFullYear()
</script>

<template>
  <footer class="no-print relative overflow-hidden bg-ink text-cream grain">
    <div class="container-x relative grid gap-12 py-16 md:grid-cols-12">
      <div class="md:col-span-5">
        <BrandMark light />
        <p class="mt-5 max-w-sm text-cream/65">{{ restaurant.description }}</p>
        <div class="mt-6 flex gap-2">
          <a v-for="(url, key) in restaurant.socials" :key="key" :href="url" target="_blank" rel="noopener" :aria-label="key" class="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-cream/80 transition hover:border-saffron hover:text-saffron">
            <Icon :name="key === 'tiktok' ? 'sparkle' : key" :size="18" />
          </a>
        </div>
      </div>

      <div class="md:col-span-3">
        <h3 class="text-xs font-extrabold uppercase tracking-[.22em] text-saffron">Horaires</h3>
        <ul class="mt-4 space-y-2 text-sm text-cream/75">
          <li v-for="h in restaurant.hours" :key="h.label" class="flex justify-between gap-6">
            <span>{{ h.label }}</span><span class="tabular-nums">{{ h.open.replace(':', 'h') }} – {{ h.close.replace(':', 'h') }}</span>
          </li>
        </ul>
        <p class="mt-4 flex items-center gap-2 text-sm text-cream/75">
          <Icon name="pin" :size="16" />
          {{ [restaurant.address.street, `${restaurant.address.postalCode} ${restaurant.address.city}`].filter(Boolean).join(', ') }}
        </p>
        <a v-if="restaurant.phone" :href="`tel:${restaurant.phone.replace(/\s/g, '')}`" class="mt-2 flex items-center gap-2 text-sm text-cream/75 hover:text-white"><Icon name="phone" :size="16" /> {{ restaurant.phone }}</a>
      </div>

      <nav class="md:col-span-2" aria-label="Pied de page">
        <h3 class="text-xs font-extrabold uppercase tracking-[.22em] text-saffron">Explorer</h3>
        <ul class="mt-4 space-y-2 text-sm text-cream/75">
          <li><NuxtLink to="/carte" class="hover:text-white">La carte</NuxtLink></li>
          <li><NuxtLink to="/a-propos" class="hover:text-white">Notre histoire</NuxtLink></li>
          <li><NuxtLink to="/contact" class="hover:text-white">Contact</NuxtLink></li>
          <li><NuxtLink to="/compte" class="hover:text-white">Mon compte</NuxtLink></li>
        </ul>
      </nav>

      <nav class="md:col-span-2" aria-label="Informations légales">
        <h3 class="text-xs font-extrabold uppercase tracking-[.22em] text-saffron">Légal</h3>
        <ul class="mt-4 space-y-2 text-sm text-cream/75">
          <li><NuxtLink to="/mentions-legales" class="hover:text-white">Mentions légales</NuxtLink></li>
          <li><NuxtLink to="/confidentialite" class="hover:text-white">Confidentialité</NuxtLink></li>
          <li><button class="hover:text-white" @click="useConsent().reopen()">Gérer les cookies</button></li>
        </ul>
      </nav>
    </div>

    <div class="relative border-t border-white/10">
      <div class="container-x flex flex-col items-center justify-between gap-3 py-6 text-xs text-cream/50 sm:flex-row">
        <p>© {{ year }} {{ restaurant.name }} · Paiement sécurisé par Stripe</p>
        <p v-if="restaurant.forSale.enabled">
          Vous voulez ce site pour votre restaurant ?
          <a :href="`mailto:${restaurant.forSale.contact}`" class="font-semibold text-saffron hover:underline">Contactez-nous</a>
        </p>
      </div>
    </div>
  </footer>
</template>
