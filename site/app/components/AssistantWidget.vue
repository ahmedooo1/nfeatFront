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
    return { from: 'bot', text: `${status.value.label}. ` + restaurant.hours.map((h) => `${h.label} : ${h.open.replace(':', 'h')} – ${h.close.replace(':', 'h')}`).join(' · ') }
  }
  if (/où|adresse|venir|situ|localis/.test(t)) {
    return { from: 'bot', text: `Nous sommes à ${[restaurant.address.street, `${restaurant.address.postalCode} ${restaurant.address.city}`].filter(Boolean).join(', ')}.`, links: [{ label: 'Nous contacter', to: '/contact' }] }
  }
  if (/command|emporter|livr|payer|paiement/.test(t)) {
    return { from: 'bot', text: `Ajoutez vos plats au panier, payez en ligne en toute sécurité (Stripe) et récupérez votre commande en ~${restaurant.pickupMinutes} minutes.`, links: [{ label: 'Voir la carte', to: '/carte' }] }
  }
  if (/conseil|recommand|meilleur|populaire|spécialit|faim/.test(t)) {
    const top = [...dishes.value].sort((a, b) => b.commentCount - a.commentCount).slice(0, 3)
    if (!top.length) return { from: 'bot', text: 'Toute la carte est faite maison : laissez-vous tenter !', links: [{ label: 'Voir la carte', to: '/carte' }] }
    return { from: 'bot', text: 'Nos clients adorent :', links: top.map((d) => ({ label: `${d.name} · ${formatPrice(d.price)}`, to: `/carte/${d.id}` })) }
  }
  const match = dishes.value.filter((d) => t.split(/\s+/).some((w) => w.length > 3 && `${d.name} ${d.description}`.toLowerCase().includes(w))).slice(0, 3)
  if (match.length) return { from: 'bot', text: 'Voici ce que j’ai trouvé sur la carte :', links: match.map((d) => ({ label: `${d.name} · ${formatPrice(d.price)}`, to: `/carte/${d.id}` })) }
  if (/contact|téléphone|telephone|mail|joindre/.test(t)) return { from: 'bot', text: 'Écrivez-nous, nous répondons vite.', links: [{ label: 'Formulaire de contact', to: '/contact' }] }
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
  if (v && !messages.value.length) messages.value.push({ from: 'bot', text: `Bonjour 👋 Je suis l’assistant de ${restaurant.name}. Comment puis-je vous aider ?` })
})
</script>

<template>
  <div class="no-print fixed bottom-4 right-4 z-[45] sm:bottom-6 sm:right-6">
    <Transition name="fade">
      <div v-if="open" class="mb-3 flex h-[28rem] w-[min(92vw,22rem)] flex-col overflow-hidden rounded-[1.75rem] border border-ink/10 bg-cream shadow-2xl">
        <div class="flex items-center gap-3 bg-ink px-5 py-4 text-cream">
          <span class="grid h-9 w-9 place-items-center rounded-full bg-saffron text-lg">🧑‍🍳</span>
          <div class="flex-1">
            <p class="font-semibold">Assistant {{ restaurant.name }}</p>
            <p class="text-xs text-cream/60">Répond instantanément</p>
          </div>
          <button class="grid h-8 w-8 place-items-center rounded-full hover:bg-white/10" aria-label="Fermer" @click="open = false"><Icon name="x" :size="16" /></button>
        </div>
        <div ref="scroller" class="flex-1 space-y-3 overflow-y-auto p-4">
          <div v-for="(m, i) in messages" :key="i" class="flex" :class="m.from === 'me' ? 'justify-end' : ''">
            <div class="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm" :class="m.from === 'me' ? 'rounded-br-md bg-ember text-white' : 'rounded-bl-md bg-white shadow-sm'">
              {{ m.text }}
              <div v-if="m.links" class="mt-2 flex flex-col gap-1.5">
                <NuxtLink v-for="l in m.links" :key="l.to" :to="l.to" class="rounded-xl bg-cream px-3 py-2 font-semibold text-ink hover:bg-cream-2" @click="open = false">{{ l.label }} →</NuxtLink>
              </div>
            </div>
          </div>
        </div>
        <div class="flex gap-1.5 overflow-x-auto px-4 pb-2 scrollbar-none">
          <button v-for="s in suggestions" :key="s" class="shrink-0 rounded-full border border-ink/10 bg-white px-3 py-1.5 text-xs font-semibold hover:border-ember" @click="ask(s)">{{ s }}</button>
        </div>
        <form class="flex gap-2 border-t border-ink/10 p-3" @submit.prevent="ask(input)">
          <input v-model="input" class="field !rounded-full !py-2.5" placeholder="Posez votre question…" aria-label="Votre question">
          <button class="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ink text-cream" aria-label="Envoyer"><Icon name="arrow" :size="18" /></button>
        </form>
      </div>
    </Transition>
    <button class="ml-auto grid h-14 w-14 place-items-center rounded-full bg-ink text-cream shadow-xl ring-4 ring-cream transition hover:scale-105" :aria-label="open ? 'Fermer l’assistant' : 'Ouvrir l’assistant'" @click="open = !open">
      <Icon :name="open ? 'x' : 'chat'" :size="22" />
    </button>
  </div>
</template>
