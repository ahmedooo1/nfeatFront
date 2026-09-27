<script setup lang="ts">
import { restaurant } from '~/restaurant.config'

const { dishes } = await useMenu()
const featured = computed(() => dishes.value.slice(0, 8))

// Diaporama du fond : la photo de la salle puis les photos des plats.
const slides = computed(() => ['/images/restaurant.jpg', ...dishes.value.filter((d) => d.image_url).slice(0, 5).map((d) => imageUrl(d.image_url)!)])
const current = ref(0)
onMounted(() => {
  const t = setInterval(() => (current.value = (current.value + 1) % slides.value.length), 5000)
  onBeforeUnmount(() => clearInterval(t))
})

useSeoMeta({
  title: `${restaurant.name}, restaurant à ${restaurant.address.city}`,
  description: restaurant.description,
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

const services = [
  { icon: 'utensils', title: 'Service de traiteur', text: 'Nous offrons un service de traiteur pour vos événements spéciaux avec des plats délicieux et un service professionnel.' },
  { icon: 'clock', title: 'Horaires d’ouverture', text: restaurant.hours.map((h) => `${h.label} de ${formatHour(h.open)} à ${formatHour(h.close)}`).join('. ') + '.' },
  { icon: 'bag', title: 'Commande en ligne', text: 'Commandez vos plats sur le site, payez en ligne et récupérez votre commande au restaurant.' },
]

function scrollToMenu() {
  document.getElementById('menus')?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <div>
    <a v-if="restaurant.forSale.enabled" :href="`mailto:${restaurant.forSale.contact}`" class="no-print animate-pulse-soft fixed right-4 top-24 z-30 rounded-md bg-red-600 px-4 py-2 text-center font-bold shadow-lg">
      Site à vendre !<br><span class="text-yellow-300 underline">Contactez-nous</span>
    </a>

    <section class="relative -mt-[88px] flex h-screen min-h-[560px] items-center justify-center overflow-hidden text-center sm:-mt-[104px]">
      <img
        v-for="(src, i) in slides"
        :key="src"
        :src="src"
        alt=""
        class="absolute inset-0 h-full w-full object-cover transition-opacity duration-1000"
        :class="i === current ? 'opacity-100' : 'opacity-0'"
        :fetchpriority="i === 0 ? 'high' : undefined"
      >
      <div class="absolute inset-0 bg-black/55" />
      <div class="relative px-4">
        <img src="/images/logo.png" :alt="`Logo ${restaurant.name}`" class="mx-auto w-44 sm:w-56">
        <h1 class="mt-4 text-4xl font-bold sm:text-5xl">Bienvenue chez {{ restaurant.name }}</h1>
        <p class="mt-3 text-lg">{{ restaurant.tagline }}</p>
        <div class="mt-7 flex flex-wrap justify-center gap-3">
          <button class="btn-primary !px-6 !py-3" @click="scrollToMenu">Voir le menu <Icon name="list" :size="20" /></button>
          <NuxtLink to="/carte" class="btn-ghost !px-6 !py-3">Commander</NuxtLink>
        </div>
      </div>
    </section>

    <section id="menus" class="scroll-mt-24 py-16">
      <div class="container-x text-center">
        <h2 class="brush-title mb-12">Nos menus</h2>
        <div v-if="featured.length" class="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <DishCard v-for="d in featured" :key="d.id" :dish="d" />
        </div>
        <div v-else class="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <div v-for="i in 4" :key="i" class="skeleton h-80" />
        </div>
        <NuxtLink to="/carte" class="btn-primary mt-10">Voir tout le menu</NuxtLink>
      </div>
    </section>

    <section class="py-16">
      <div class="container-x">
        <div class="text-center"><h2 class="brush-title mb-12">À propos de {{ restaurant.name }}</h2></div>
        <div class="flex flex-col items-center gap-8 md:flex-row">
          <img src="/images/restaurant.jpg" alt="La salle du restaurant" class="w-full rounded-lg shadow-lg transition duration-300 hover:scale-[1.02] md:w-1/2" loading="lazy">
          <div class="md:w-1/2 md:pl-8">
            <p class="text-lg leading-relaxed">
              {{ restaurant.name }} est un restaurant de renommée offrant une expérience culinaire exceptionnelle. Notre équipe de chefs talentueux utilise
              les meilleurs ingrédients pour créer des plats délicieux et innovants. Venez découvrir notre menu varié et savourez chaque bouchée.
            </p>
            <NuxtLink to="/a-propos" class="btn-primary mt-6">En savoir plus</NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <section class="py-16">
      <div class="container-x">
        <div class="text-center"><h2 class="brush-title mb-12">Nos services</h2></div>
        <div class="grid gap-8 md:grid-cols-3">
          <div v-for="s in services" :key="s.title" class="card p-8 text-center transition duration-300 hover:scale-[1.03]">
            <Icon :name="s.icon" :size="40" class="mx-auto text-brand" />
            <h3 class="mt-4 text-xl font-semibold">{{ s.title }}</h3>
            <p class="mt-2 text-gray-200">{{ s.text }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
