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
  <article class="card flex flex-col overflow-hidden text-left transition duration-300 hover:scale-[1.03]">
    <NuxtLink :to="`/carte/${dish.id}`" class="block h-48" :aria-label="dish.name">
      <DishImage :src="dish.image_url" :alt="dish.name" :eager="eager" />
    </NuxtLink>
    <div class="flex flex-1 flex-col p-4">
      <h3 class="text-xl font-semibold"><NuxtLink :to="`/carte/${dish.id}`" class="hover:text-brand">{{ dish.name }}</NuxtLink></h3>
      <p class="mt-2 line-clamp-2 text-sm text-gray-200">{{ dish.description }}</p>
      <NuxtLink :to="`/carte/${dish.id}`" class="mt-1 text-sm text-brand underline">Voir plus</NuxtLink>
      <div class="mt-auto flex items-center justify-between pt-4">
        <p class="text-lg font-bold">{{ formatPrice(dish.price) }}</p>
        <span class="flex items-center gap-1 text-xs text-gray-300"><Icon name="chat" :size="14" /> {{ dish.commentCount }}</span>
      </div>
      <button class="btn-add mt-3 w-full !rounded-lg" :disabled="adding" @click="add">
        <Icon :name="adding ? 'check' : 'bag'" :size="18" /> Ajouter au panier
      </button>
    </div>
  </article>
</template>
