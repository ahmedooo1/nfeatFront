<script setup lang="ts">
import { restaurant } from '~/restaurant.config'
import type { Dish } from '~/types'

// Assistant à réponses préparées (sans IA) : horaires, carte, commande, contact.
type Msg = { from: 'bot' | 'me'; text: string; links?: { label: string; to: string }[] }

const open = ref(false)
const input = ref('')
const messages = ref<Msg[]>([])
const scroller = ref<HTMLElement>()
const dishes = useState<Dish[]>('assistant:dishes', () => [])
const { status } = useOpeningHours()

const suggestions = ['Vos horaires ?', 'Que me conseillez-vous ?', 'Comment commander ?', 'Où êtes-vous ?']

async function ensureMenu() {
  if (dishes.value.length) return
  const rows = await $fetch<unknown[]>(`${useRuntimeConfig().public.apiBase}/api/menu`).catch(() => [])
  dishes.value = normalizeDishes(rows as never)
}

function answer(q: string): Msg {
  const t = q.toLowerCase()
  if (/horaire|ouvert|heure|ferm/.test(t)) {
    return { from: 'bot', text: `${status.value.label}. ` + restaurant.hours.map((h) => `${h.label} de ${formatHour(h.open)} à ${formatHour(h.close)}`).join('. ') }
  }
  if (/où|adresse|venir|situ|localis/.test(t)) {
    return { from: 'bot', text: `Nous sommes à ${[restaurant.address.street, `${restaurant.address.postalCode} ${restaurant.address.city}`].filter(Boolean).join(', ')}.`, links: [{ label: 'Nous contacter', to: '/contact' }] }
  }
  if (/command|emporter|livr|payer|paiement/.test(t)) {
    return { from: 'bot', text: `Ajoutez vos plats au panier, payez en ligne par carte et récupérez votre commande au restaurant.`, links: [{ label: 'Voir la carte', to: '/carte' }] }
  }
  if (/conseil|recommand|meilleur|populaire|spécialit|faim/.test(t)) {
    const top = [...dishes.value].sort((a, b) => b.commentCount - a.commentCount).slice(0, 3)
    if (!top.length) return { from: 'bot', text: 'Découvrez toute notre carte.', links: [{ label: 'Voir la carte', to: '/carte' }] }
    return { from: 'bot', text: 'Les plats préférés de nos clients :', links: top.map((d) => ({ label: `${d.name}, ${formatPrice(d.price)}`, to: `/carte/${d.id}` })) }
  }
  const match = dishes.value.filter((d) => t.split(/\s+/).some((w) => w.length > 3 && `${d.name} ${d.description}`.toLowerCase().includes(w))).slice(0, 3)
  if (match.length) return { from: 'bot', text: 'Voici ce que j’ai trouvé sur la carte :', links: match.map((d) => ({ label: `${d.name}, ${formatPrice(d.price)}`, to: `/carte/${d.id}` })) }
  if (/contact|téléphone|telephone|mail|joindre/.test(t)) return { from: 'bot', text: 'Vous pouvez nous écrire via le formulaire de contact.', links: [{ label: 'Formulaire de contact', to: '/contact' }] }
  return { from: 'bot', text: 'Je peux vous renseigner sur nos horaires, la carte, la commande en ligne ou l’adresse. Que souhaitez-vous savoir ?' }
}

async function ask(q: string) {
  if (!q.trim()) return
  messages.value.push({ from: 'me', text: q })
  input.value = ''
  await ensureMenu()
  setTimeout(() => {
    messages.value.push(answer(q))
    nextTick(() => scroller.value?.scrollTo({ top: scroller.value.scrollHeight, behavior: 'smooth' }))
  }, 350)
}

watch(open, (v) => {
  if (v && !messages.value.length) messages.value.push({ from: 'bot', text: `Bonjour, je suis l’assistant de ${restaurant.name}. Comment puis-je vous aider ?` })
})
</script>

<template>
  <div class="no-print fixed bottom-4 right-4 z-[45]">
    <Transition name="fade">
      <div v-if="open" class="mb-3 flex h-[28rem] w-[min(92vw,22rem)] flex-col overflow-hidden rounded-lg bg-gray-900 text-white shadow-2xl">
        <div class="flex items-center gap-3 bg-brand px-4 py-3">
          <img src="/images/logo.png" alt="" class="h-9 w-9 rounded-full bg-white object-contain p-0.5">
          <p class="flex-1 font-semibold">Assistant {{ restaurant.name }}</p>
          <button class="rounded-full p-1 hover:bg-white/20" aria-label="Fermer" @click="open = false"><Icon name="x" :size="16" /></button>
        </div>
        <div ref="scroller" class="flex-1 space-y-3 overflow-y-auto p-3">
          <div v-for="(m, i) in messages" :key="i" class="flex" :class="m.from === 'me' ? 'justify-end' : ''">
            <div class="max-w-[85%] rounded-lg px-3 py-2 text-sm" :class="m.from === 'me' ? 'bg-brand text-white' : 'bg-gray-700'">
              {{ m.text }}
              <div v-if="m.links" class="mt-2 flex flex-col gap-1">
                <NuxtLink v-for="l in m.links" :key="l.to" :to="l.to" class="rounded bg-gray-600 px-2 py-1.5 hover:bg-gray-500" @click="open = false">{{ l.label }}</NuxtLink>
              </div>
            </div>
          </div>
        </div>
        <div class="flex gap-1.5 overflow-x-auto px-3 pb-2 scrollbar-none">
          <button v-for="s in suggestions" :key="s" class="shrink-0 rounded-full bg-gray-700 px-3 py-1 text-xs hover:bg-gray-600" @click="ask(s)">{{ s }}</button>
        </div>
        <form class="flex gap-2 border-t border-white/10 p-3" @submit.prevent="ask(input)">
          <input v-model="input" class="field !py-2" placeholder="Votre question" aria-label="Votre question">
          <button class="rounded-lg bg-brand px-3 hover:bg-brand-dark" aria-label="Envoyer"><Icon name="arrow" :size="18" /></button>
        </form>
      </div>
    </Transition>
    <button class="ml-auto grid h-14 w-14 place-items-center rounded-full bg-brand shadow-xl ring-2 ring-white transition hover:scale-105" :aria-label="open ? 'Fermer l’assistant' : 'Ouvrir l’assistant'" @click="open = !open">
      <Icon v-if="open" name="x" :size="22" />
      <img v-else src="/images/logo.png" alt="" class="h-11 w-11 rounded-full bg-white object-contain p-0.5">
    </button>
  </div>
</template>
