<script setup lang="ts">
import { restaurant } from '~/restaurant.config'
definePageMeta({ alias: ['/about'] })
useSeoMeta({ title: 'Notre histoire', description: `L’histoire de ${restaurant.name} : une cuisine ${restaurant.cuisine.join(', ').toLowerCase()} faite maison à ${restaurant.address.city}.` })

const values = [
  { icon: 'leaf', title: 'Qualité', text: 'Des produits frais, des épices choisies avec soin, rien d’industriel dans nos cuisines.' },
  { icon: 'flame', title: 'Transmission', text: 'Des recettes de famille, apprises aux côtés de nos mères et grands-mères, réinterprétées avec respect.' },
  { icon: 'users', title: 'Hospitalité', text: 'Chez nous, chaque client est un invité. Le sourire et la générosité font partie du menu.' },
]
</script>

<template>
  <div>
    <section class="relative overflow-hidden bg-ink py-20 text-cream grain sm:py-28">
      <img src="/images/restaurant.jpg" alt="" class="absolute inset-0 h-full w-full object-cover opacity-25">
      <div class="container-x relative max-w-3xl text-center">
        <p class="eyebrow justify-center !text-saffron">Notre histoire</p>
        <h1 class="mt-4 font-display text-5xl font-semibold leading-[1.02] tracking-tight sm:text-7xl">La cuisine de chez nous,<br><em class="text-saffron">partagée avec vous.</em></h1>
      </div>
    </section>

    <section class="container-x grid gap-14 py-20 sm:py-28 lg:grid-cols-2 lg:items-center">
      <div class="reveal" v-reveal>
        <p class="eyebrow">Notre mission</p>
        <h2 class="mt-3 font-display text-4xl font-semibold leading-tight sm:text-5xl">Faire voyager, une assiette après l’autre.</h2>
        <div class="mt-6 space-y-4 text-lg text-muted">
          <p>{{ restaurant.name }} est né d’une envie simple : faire découvrir les saveurs du Levant et du Kurdistan telles qu’on les aime à la maison, généreuses et parfumées.</p>
          <p>Chaque matin, l’équipe prépare les mezzés, marine les viandes et façonne les pâtisseries. Le soir venu, la salle se remplit d’odeurs de grillades et de thé à la menthe.</p>
        </div>
      </div>
      <div v-reveal="120" class="reveal arch mx-auto aspect-[4/5] w-full max-w-md shadow-2xl">
        <img src="/images/restaurant.jpg" alt="La salle du restaurant" class="h-full w-full object-cover" loading="lazy">
      </div>
    </section>

    <section class="bg-cream-2/60 py-20 sm:py-28">
      <div class="container-x">
        <h2 v-reveal class="reveal text-center font-display text-4xl font-semibold sm:text-5xl">Nos valeurs</h2>
        <div class="mt-12 grid gap-6 md:grid-cols-3">
          <div v-for="(v, i) in values" :key="v.title" v-reveal="i * 90" class="reveal card p-8 text-center">
            <span class="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-ember/10 text-ember"><Icon :name="v.icon" :size="26" /></span>
            <h3 class="mt-5 font-display text-2xl font-semibold">{{ v.title }}</h3>
            <p class="mt-2 text-muted">{{ v.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="container-x py-20 text-center sm:py-28">
      <h2 class="font-display text-4xl font-semibold sm:text-5xl">Traiteur, anniversaires, événements</h2>
      <p class="mx-auto mt-4 max-w-xl text-lg text-muted">Plateaux de mezzés, buffets orientaux, grillades pour vos fêtes : parlons de votre projet.</p>
      <div class="mt-8 flex justify-center gap-3">
        <NuxtLink to="/contact" class="btn-primary">Demander un devis</NuxtLink>
        <NuxtLink to="/carte" class="btn-ghost">Voir la carte</NuxtLink>
      </div>
    </section>
  </div>
</template>
