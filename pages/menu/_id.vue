<template>
  <div class="container mx-auto p-4 sm:w-1/2">
    <div class="bg-white rounded-lg shadow-md p-4">
      <div class="w-full max-w-md mx-auto mb-4">
        <img :src="getImageUrl(menuItem.image_url)" alt="Image de l'article du menu" class="w-full h-64 object-cover rounded-lg shadow">
      </div>
      <div class="p-4">
        <h1 class="text-3xl font-bold mb-4">{{ menuItem.name }}</h1>
        <p class="mb-4">{{ menuItem.description }}</p>
        <p class="text-lg font-bold mb-4">{{ menuItem.price }} €</p>
        <button v-if="$auth.loggedIn" @click="addToCart(menuItem)" class="bg-green-500 text-white px-4 py-2 rounded">
          <img width="25" height="25" src="https://img.icons8.com/windows/32/FFFFFF/add-to-shopping-basket.png" alt="add-to-shopping-basket"/>
        </button>
      </div>
    </div>
    <Comments :menuItemId="menuItem.id" />
  </div>
</template>

<script>
import Comments from '~/components/Comments.vue';

export default {
  components: {
    Comments
  },
  data() {
    return {
      menuItem: {},
    };
  },
  async asyncData({ params, $axios }) {
    try {
      const response = await $axios.get(`/menu/${params.id}`);
      return {
        menuItem: response.data,
      };
    } catch (error) {
      console.error('Failed to load menu item', error);
      return {
        menuItem: {},
      };
    }
  },
  methods: {
    getImageUrl(imagePath) {
  return `https://apinfeat.aaweb.fr${imagePath}`;
    },
    async addToCart(item) {
      try {
        const payload = {
          userId: this.$auth.user.id,
          menuItemId: item.id,
          quantity: 1
        };
        await this.$axios.post('/carts', payload);
        this.$toast.success('Article ajouté au panier');
      } catch (error) {
        console.error('Failed to add item to cart', error);
      }
    }
  }
};
</script>

<style scoped>
/* Ajoutez vos styles ici */
</style>
