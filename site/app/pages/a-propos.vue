<script setup lang="ts">
import { restaurant } from '~/restaurant.config'
definePageMeta({ alias: ['/about'] })
useSeoMeta({ title: 'À propos', description: `Découvrez l’histoire de ${restaurant.name}, notre équipe et nos valeurs.` })

const team = [
  { name: 'Ahmad Ahmad', role: 'Chef principal', photo: '/images/equipe-ahmad.jpg' },
  { name: 'Alex Dichon', role: 'Sous-chef', photo: null },
  { name: 'Sarah Normand', role: 'Cheffe pâtissière', photo: null },
]
const values = [
  { icon: 'star', title: 'Qualité', text: 'Nous utilisons des ingrédients de la plus haute qualité dans tous nos plats.' },
  { icon: 'utensils', title: 'Créativité', text: 'Nos chefs créent des plats innovants et délicieux.' },
  { icon: 'users', title: 'Service', text: 'Nous nous efforçons d’offrir un service exceptionnel à chaque client.' },
]
</script>

<template>
  <div>
    <section class="relative -mt-[88px] flex h-[70vh] min-h-[420px] items-center justify-center text-center sm:-mt-[104px]">
      <img src="/images/restaurant.jpg" alt="" class="absolute inset-0 h-full w-full object-cover">
      <div class="absolute inset-0 bg-black/60" />
      <div class="relative px-4">
        <h1 class="text-4xl font-bold sm:text-5xl">À propos de {{ restaurant.name }}</h1>
        <p class="mt-3 text-lg">Découvrez l’histoire derrière {{ restaurant.name }}</p>
      </div>
    </section>

    <section class="py-16 text-center">
      <div class="container-x">
        <h2 class="brush-title mb-8">Notre mission</h2>
        <p class="mx-auto max-w-3xl text-lg leading-relaxed text-gray-100">
          Chez {{ restaurant.name }}, notre mission est de fournir une expérience culinaire exceptionnelle en proposant des plats délicieux et innovants,
          élaborés à partir des meilleurs ingrédients. Nous nous engageons à créer une atmosphère accueillante où les clients peuvent savourer de
          délicieux repas et créer des souvenirs durables.
        </p>
      </div>
    </section>

    <section class="bg-tile py-16">
      <div class="container-x text-center">
        <h2 class="text-3xl font-bold">Rencontrez notre équipe</h2>
        <div class="mt-10 grid gap-8 sm:grid-cols-3">
          <div v-for="m in team" :key="m.name">
            <img v-if="m.photo" :src="m.photo" :alt="m.name" class="mx-auto h-40 w-40 rounded-full object-cover shadow-lg" loading="lazy">
            <span v-else class="mx-auto grid h-40 w-40 place-items-center rounded-full bg-gray-700 text-4xl font-bold shadow-lg">{{ initials(m.name) }}</span>
            <p class="mt-4 text-xl font-semibold">{{ m.name }}</p>
            <p class="text-gray-200">{{ m.role }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="py-16">
      <div class="container-x text-center">
        <h2 class="brush-title mb-10">Nos valeurs</h2>
        <div class="grid gap-8 md:grid-cols-3">
          <div v-for="v in values" :key="v.title" class="card p-8">
            <Icon :name="v.icon" :size="36" class="mx-auto text-brand" />
            <h3 class="mt-4 text-xl font-semibold">{{ v.title }}</h3>
            <p class="mt-2 text-gray-200">{{ v.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="pb-8 text-center">
      <div class="container-x">
        <h2 class="text-3xl font-bold">Prenez contact</h2>
        <p class="mx-auto mt-4 max-w-2xl text-gray-200">
          Une question sur notre menu, besoin d’aide pour une commande ou envie de partager votre avis ? N’hésitez pas à nous contacter.
        </p>
        <NuxtLink to="/contact" class="btn-primary mt-6">Contactez-nous</NuxtLink>
      </div>
    </section>
  </div>
</template>
