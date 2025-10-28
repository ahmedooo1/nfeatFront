<template>
  <div class="container mx-auto px-6 py-16">
    <div class="relative text-center">
      <h2 class="text-4xl font-bold text-center mb-12 text-white bg-title">Articles du Menu</h2>
    </div>
    <div class="mb-6">
      <div class="relative">
        <select id="category_select" v-model="selectedCategory" @change="fetchMenuItems" class="appearance-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
          <option value="" disabled selected>Sélectionnez une catégorie</option>
          <option value="all">Toutes les catégories</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ category.title }}
          </option>
        </select>
        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M7 10l5 5 5-5H7z"/></svg>
        </div>
      </div>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
      <div v-for="item in menuItems" :key="item.id" class="bg-white rounded-lg shadow-lg overflow-hidden transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer" @click="goToDetails(item.id)">
        <img :src="getImageUrl(item.image_url)" :alt="item.name" class="w-full h-48 object-cover rounded-t-lg">
        <div class="p-4 relative">
          <h3 class="text-xl font-semibold mb-2">{{ item.name }}</h3>
          <p v-if="item.description">{{ truncateDescription(item.description) }} <span class="underline text-blue-500 cursor-pointer" @click.stop="goToDetails(item.id)">Voir plus</span></p>
          <p class="text-lg font-bold mt-2">{{ item.price }} €</p>
          <button v-if="$auth.loggedIn" @click.stop="addToCart(item)" class="bg-green-500 text-white px-4 py-2 rounded mt-2 transition duration-300 ease-in-out transform hover:scale-105">
            <img width="25" height="25" src="https://img.icons8.com/windows/32/FFFFFF/add-to-shopping-basket.png" alt="add-to-shopping-basket"/>
          </button>

          <button v-if="!$auth.loggedIn" @click.stop="openModal" class="bg-green-500 text-white px-4 py-2 rounded mt-2 transition duration-300 ease-in-out transform hover:scale-105">
            <img width="25" height="25" src="https://img.icons8.com/windows/32/FFFFFF/add-to-shopping-basket.png" alt="add-to-shopping-basket"/>
          </button>
          <p class="absolute bottom-2 right-2 text-gray-600 text-xs flex font-bold">{{ item.commentCount }} <img width="24" height="24" src="https://img.icons8.com/material-outlined/24/737373/comments--v1.png" alt="comments--v1"/></p>
        </div>
      </div>
    </div>
    <AuthModal v-if="showModal" @close="showModal = false" />
  </div>
</template>

<script>
import AuthModal from '~/components/Modal.vue'

export default {
  components: {
    AuthModal
  },
  data() {
    return {
      categories: [],
      menuItems: [],
      selectedCategory: 'all',
      showModal: false
    }
  },
  async mounted() {
    await this.fetchCategories();
    await this.fetchMenuItems();
  },
  methods: {
    async fetchCategories() {
      try {
        const response = await this.$axios.get('/categories');
        this.categories = response.data;
      } catch (error) {
        console.error('Failed to fetch categories', error);
      }
    },
    async fetchMenuItems() {
      try {
        const response = await this.$axios.get('/menu', {
          params: { categoryId: this.selectedCategory === 'all' ? null : this.selectedCategory }
        });
        this.menuItems = response.data.map(item => {
          // Flatten the response to remove the extra layer
          return {
            ...item[0],
            commentCount: item.commentCount
          };
        });
      } catch (error) {
        console.error('Failed to fetch menu items', error);
      }
    },
    getImageUrl(imagePath) {
  return `https://apinfeat.aaweb.fr${imagePath}`;
    },
    async addToCart(item) {
      if (!this.$auth.loggedIn) {
        this.showModal = true; // Open the modal if not logged in
        return;
      }
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
    },
    goToDetails(id) {
      this.$router.push({ path: `/menu/${id}` });
    },
    truncateDescription(description) {
      const maxLength = 100; // Adjust the length as needed
      return description.length > maxLength ? description.substring(0, maxLength) + '...' : description;
    },
    openModal() {
      this.showModal = true
    }
  },
  head() {
    return {
      title: 'Articles du Menu',
      meta: [
        { hid: 'description', name: 'description', content: 'Découvrez les articles de notre menu chez NF-EAT.' },
        { name: 'keywords', content: 'restaurant, NF-EAT, menu, articles, food' }
      ]
    }
  }
}
</script>

<style scoped>
/* Ajoutez vos styles ici */
.bg-title {
  position: relative;
  display: inline-block;
  padding: 0 2rem;
  background: url('../assets/images/Paint_Brush.png') no-repeat center;
  background-size: cover;
  padding: 1rem 3rem;
}
</style>
