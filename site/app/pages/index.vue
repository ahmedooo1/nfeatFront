<script setup lang="ts">
import { restaurant } from '~/restaurant.config'

const { dishes, categories } = await useMenu()
const { status } = useOpeningHours()
const cart = useCart()

const featured = computed(() => [...dishes.value].sort((a, b) => b.commentCount - a.commentCount).slice(0, 6))
const star = computed(() => featured.value[0])
const marquee = computed(() => {
  const names = dishes.value.map((d) => d.name)
  return names.length ? names : ['Chawarma', 'Falafel', 'Houmous', 'Taboulé', 'Kebbé', 'Baklava']
})

useSeoMeta({
  title: `${restaurant.name} · Restaurant oriental à ${restaurant.address.city}`,
  description: restaurant.description,
  ogTitle: `${restaurant.name} · ${restaurant.tagline}`,
  ogDescription: restaurant.description,
})
useHead({
  titleTemplate: '%s',
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Restaurant',
      name: restaurant.name,
      alternateName: restaurant.fullName,
      url: restaurant.siteUrl,
      image: `${restaurant.siteUrl}/images/restaurant.jpg`,
      servesCuisine: restaurant.cuisine,
      priceRange: restaurant.priceRange,
      hasMenu: `${restaurant.siteUrl}/carte`,
      acceptsReservations: false,
      ...(restaurant.phone ? { telephone: restaurant.phone } : {}),
      address: {
        '@type': 'PostalAddress',
        ...(restaurant.address.street ? { streetAddress: restaurant.address.street } : {}),
        postalCode: restaurant.address.postalCode,
        addressLocality: restaurant.address.city,
        addressCountry: restaurant.address.country,
      },
      openingHoursSpecification: restaurant.hours.map((h) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: h.days.map((d) => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d]),
        opens: h.open,
        closes: h.close,
      })),
    }),
  }],
})

const promises = [
  { icon: 'leaf', title: 'Fait maison, chaque jour', text: 'Pois chiches trempés la veille, pain cuit sur place, épices torréfiées par nos soins.' },
  { icon: 'clock', title: `Prêt en ~${restaurant.pickupMinutes} minutes`, text: 'Commandez en ligne, on lance la cuisine aussitôt. Vous n’avez plus qu’à passer.' },
  { icon: 'shield', title: 'Paiement 100 % sécurisé', text: 'Carte, Apple Pay ou Google Pay via Stripe. Vos données bancaires ne passent jamais par nous.' },
]
</script>

<template>
  <div>
    <!-- Ouverture ------------------------------------------------------- -->
    <section class="relative isolate min-h-[92svh] overflow-hidden bg-ink text-cream grain">
      <img src="/images/restaurant.jpg" alt="La salle du restaurant NF-EAT, baignée de lumière" class="absolute inset-0 -z-10 h-full w-full scale-105 object-cover opacity-45" fetchpriority="high">
      <div class="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/85 to-ink/20" />
      <div class="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-ink to-transparent" />

      <div class="container-x grid min-h-[92svh] items-center gap-12 pb-28 pt-32 lg:grid-cols-12">
        <div class="lg:col-span-7">
          <ClientOnly>
            <span class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold backdrop-blur">
              <span class="relative flex h-2.5 w-2.5">
                <span class="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" :class="status.open ? 'bg-emerald-400' : 'bg-saffron'" />
                <span class="relative inline-flex h-2.5 w-2.5 rounded-full" :class="status.open ? 'bg-emerald-400' : 'bg-saffron'" />
              </span>
              {{ status.label }}
            </span>
          </ClientOnly>
          <h1 class="mt-6 font-display text-[clamp(3rem,8vw,6.5rem)] font-semibold leading-[.92] tracking-tight">
            Saveurs d’Orient,<br>
            <em class="font-medium text-saffron">faites maison.</em>
          </h1>
          <p class="mt-6 max-w-xl text-lg text-cream/75">{{ restaurant.description }}</p>
          <div class="mt-9 flex flex-wrap gap-3">
            <NuxtLink to="/carte" class="btn-primary !px-7 !py-4 text-base">Commander maintenant <Icon name="arrow" :size="18" /></NuxtLink>
            <NuxtLink to="/a-propos" class="btn-light !px-7 !py-4 text-base">Notre histoire</NuxtLink>
          </div>
          <dl class="mt-12 flex flex-wrap gap-x-10 gap-y-4 text-sm">
            <div><dt class="text-cream/50">Retrait</dt><dd class="font-display text-2xl font-semibold">~{{ restaurant.pickupMinutes }} min</dd></div>
            <div><dt class="text-cream/50">Cuisine</dt><dd class="font-display text-2xl font-semibold">{{ restaurant.cuisine.slice(0, 3).join(' · ') }}</dd></div>
            <div><dt class="text-cream/50">Au menu</dt><dd class="font-display text-2xl font-semibold">{{ dishes.length || '30' }}+ plats</dd></div>
          </dl>
        </div>

        <!-- Plat vedette -->
        <div v-if="star" class="hidden lg:col-span-5 lg:block">
          <div class="relative ml-auto max-w-sm rotate-[1.5deg] rounded-[2rem] border border-white/15 bg-white/10 p-3 shadow-2xl backdrop-blur-xl transition hover:rotate-0">
            <div class="arch aspect-[4/5]">
              <DishImage :src="star.image_url" :alt="star.name" :category="star.category?.title" eager />
            </div>
            <div class="flex items-center justify-between gap-4 p-4">
              <div>
                <p class="text-xs font-bold uppercase tracking-[.2em] text-saffron">Le préféré des clients</p>
                <p class="mt-1 font-display text-2xl font-semibold">{{ star.name }}</p>
              </div>
              <button class="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-ember text-white shadow-lg transition hover:scale-105" :aria-label="`Ajouter ${star.name}`" @click="cart.add(star).catch((e) => useToast().error(apiMessage(e)))">
                <Icon name="plus" />
              </button>
            </div>
            <span class="absolute -left-5 top-8 rotate-[-8deg] rounded-full bg-saffron px-4 py-2 font-display text-lg font-bold text-ink shadow-lg">{{ formatPrice(star.price) }}</span>
          </div>
        </div>
      </div>

      <!-- Bandeau défilant -->
      <div class="absolute inset-x-0 bottom-0 overflow-hidden border-t border-white/10 bg-ink/60 py-4 backdrop-blur" aria-hidden="true">
        <div class="flex w-max animate-[marquee_40s_linear_infinite] gap-10 whitespace-nowrap font-display text-xl italic text-cream/70">
          <span v-for="(name, i) in [...marquee, ...marquee]" :key="i" class="flex items-center gap-10">{{ name }} <span class="text-ember not-italic">✦</span></span>
        </div>
      </div>
    </section>

    <!-- Promesses ------------------------------------------------------- -->
    <section class="container-x py-20 sm:py-28">
      <div class="grid gap-6 md:grid-cols-3">
        <div v-for="(p, i) in promises" :key="p.title" v-reveal="i * 90" class="reveal card p-7">
          <span class="grid h-12 w-12 place-items-center rounded-2xl bg-ember/10 text-ember"><Icon :name="p.icon" :size="22" /></span>
          <h2 class="mt-5 font-display text-2xl font-semibold">{{ p.title }}</h2>
          <p class="mt-2 text-muted">{{ p.text }}</p>
        </div>
      </div>
    </section>

    <!-- Incontournables ------------------------------------------------- -->
    <section class="bg-cream-2/60 py-20 sm:py-28">
      <div class="container-x">
        <div class="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div class="reveal" v-reveal>
            <p class="eyebrow">La carte</p>
            <h2 class="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">Les incontournables</h2>
            <p class="mt-3 max-w-lg text-muted">Les plats que nos habitués recommandent le plus. Tout est préparé à la commande.</p>
          </div>
          <NuxtLink to="/carte" class="btn-ghost shrink-0">Toute la carte <Icon name="arrow" :size="16" /></NuxtLink>
        </div>

        <div v-if="featured.length" class="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <DishCard v-for="(d, i) in featured" :key="d.id" class="reveal" v-reveal="(i % 3) * 90" :dish="d" />
        </div>
        <div v-else class="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div v-for="i in 3" :key="i" class="skeleton h-96" />
        </div>

        <div v-if="categories.length" class="mt-12 flex flex-wrap gap-2">
          <NuxtLink v-for="c in categories" :key="c.id" :to="`/carte#cat-${c.id}`" class="rounded-full border border-ink/10 bg-white px-5 py-2.5 text-sm font-semibold transition hover:border-ember hover:text-ember">
            {{ c.title }}
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Histoire -------------------------------------------------------- -->
    <section class="container-x grid items-center gap-14 py-20 sm:py-28 lg:grid-cols-2">
      <div v-reveal class="reveal relative mx-auto w-full max-w-md">
        <div class="arch aspect-[4/5] shadow-2xl">
          <img src="/images/restaurant.jpg" alt="Salle du restaurant" class="h-full w-full object-cover" loading="lazy">
        </div>
        <div class="absolute -bottom-6 -right-4 rounded-3xl bg-ink p-5 text-cream shadow-2xl sm:-right-10">
          <p class="font-display text-4xl font-bold text-saffron">100%</p>
          <p class="text-sm text-cream/70">fait maison, du houmous<br>au baklava</p>
        </div>
      </div>
      <div class="reveal" v-reveal="120">
        <p class="eyebrow">Notre histoire</p>
        <h2 class="mt-3 font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          Une table de famille,<br><em class="text-ember">ouverte à tous.</em>
        </h2>
        <p class="mt-6 text-lg text-muted">
          Chez {{ restaurant.name }}, on cuisine comme à la maison : des recettes transmises de génération en génération, des produits frais
          et beaucoup de générosité. Du Levant au Kurdistan, chaque assiette raconte un voyage.
        </p>
        <div class="mt-8 flex flex-wrap gap-3">
          <NuxtLink to="/a-propos" class="btn-dark">Découvrir notre histoire</NuxtLink>
          <NuxtLink to="/contact" class="btn-ghost">Traiteur & événements</NuxtLink>
        </div>
      </div>
    </section>

    <!-- Infos pratiques --------------------------------------------------- -->
    <section class="container-x pb-24">
      <div v-reveal class="reveal relative overflow-hidden rounded-[2.5rem] bg-ember px-8 py-14 text-white sm:px-14 grain">
        <div class="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-saffron/40 blur-3xl" />
        <div class="relative grid gap-10 lg:grid-cols-3 lg:items-center">
          <div class="lg:col-span-2">
            <h2 class="font-display text-4xl font-semibold leading-tight sm:text-5xl">Une petite faim ?<br>On s’en occupe.</h2>
            <p class="mt-4 max-w-lg text-white/80">Commandez maintenant, payez en ligne et récupérez vos plats encore chauds. Sans attente, sans surprise.</p>
            <NuxtLink to="/carte" class="btn mt-8 bg-white !px-7 !py-4 text-base text-ink hover:bg-cream">Je commande <Icon name="arrow" :size="18" /></NuxtLink>
          </div>
          <div class="rounded-3xl bg-black/15 p-6 backdrop-blur">
            <p class="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[.2em] text-white/70"><Icon name="clock" :size="14" /> Horaires</p>
            <ul class="mt-3 space-y-2">
              <li v-for="h in restaurant.hours" :key="h.label" class="flex justify-between gap-4 text-sm"><span>{{ h.label }}</span><span class="font-bold tabular-nums">{{ h.open.replace(':', 'h') }} – {{ h.close.replace(':', 'h') }}</span></li>
            </ul>
            <p class="mt-5 flex items-center gap-2 text-sm text-white/85"><Icon name="pin" :size="16" /> {{ [restaurant.address.street, `${restaurant.address.postalCode} ${restaurant.address.city}`].filter(Boolean).join(', ') }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style>
@keyframes marquee { to { transform: translateX(-50%); } }
@media (prefers-reduced-motion: reduce) { [class*="animate-[marquee"] { animation: none !important; } }
</style>
