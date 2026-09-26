<script setup lang="ts">
import type { Dish } from '~/types'
const props = defineProps<{ dish: Dish; eager?: boolean }>()
const cart = useCart()
const adding = ref(false)

async function add() {
  adding.value = true
  try {
    await cart.add(props.dish)
  } catch (e) {
    useToast().error(apiMessage(e))
  } finally {
    adding.value = false
  }
}
</script>

<template>
  <article class="group card relative flex flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_60px_-35px_rgba(22,17,13,.55)]">
    <NuxtLink :to="`/carte/${dish.id}`" class="relative block aspect-[4/3]" :aria-label="dish.name">
      <DishImage :src="dish.image_url" :alt="dish.name" :category="dish.category?.title" :eager="eager" />
      <span v-if="dish.category" class="absolute left-3 top-3 rounded-full bg-cream/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-ink backdrop-blur">
        {{ dish.category.title }}
      </span>
    </NuxtLink>
    <div class="flex flex-1 flex-col p-5">
      <div class="flex items-start justify-between gap-3">
        <h3 class="font-display text-xl font-semibold leading-tight">
          <NuxtLink :to="`/carte/${dish.id}`" class="after:absolute after:inset-0 after:content-['']">{{ dish.name }}</NuxtLink>
        </h3>
        <span class="shrink-0 font-display text-lg font-bold text-ember">{{ formatPrice(dish.price) }}</span>
      </div>
      <p class="mt-2 line-clamp-2 text-sm text-muted">{{ dish.description }}</p>
      <div class="mt-auto flex items-center justify-between pt-5">
        <span class="flex items-center gap-1.5 text-xs font-semibold text-muted">
          <Icon name="chat" :size="14" /> {{ dish.commentCount }} avis
        </span>
        <button class="btn-dark relative z-10 !px-4 !py-2.5" :disabled="adding" @click="add">
          <Icon :name="adding ? 'check' : 'plus'" :size="16" /> Ajouter
        </button>
      </div>
    </div>
  </article>
</template>
