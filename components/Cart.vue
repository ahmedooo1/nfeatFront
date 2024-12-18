<template>
  <div class="container mx-auto mt-8 p-4 max-w-2xl">
    <h2 class="text-2xl font-bold mb-4 text-gray-800">Votre Panier</h2>
    <div v-if="cartItems.length === 0" class="text-gray-800">Votre panier est vide.</div>
    <div v-for="(item, index) in cartItems" :key="generateUniqueKey(item, index)" class="flex bg-white rounded-lg shadow-md p-4 mb-4">
      <img :src="getImageUrl(item.image_url)" alt="Image de l'article" class="w-32 h-32 object-cover rounded-lg mr-4">
      <div class="flex-grow">
        <h3 class="text-xl font-semibold">{{ item.name }}</h3>
        <p>{{ item.description }}</p>
        <p class="text-lg font-bold">{{ item.price }} €</p>
        <p class="text-lg">Quantité : {{ item.quantity }}</p>
        <button @click="removeItem(item)" :disabled="item.loading" class="bg-red-500 text-white px-4 py-2 rounded mt-4 flex items-center">
          <img width="20" height="20" src="https://img.icons8.com/ios/50/FFFFFF/delete--v1.png" alt="delete--v1"/>
          {{ item.loading ? 'En cours...' : 'Supprimer' }}
        </button>
      </div>
    </div>
    <div v-if="cartItems.length > 0" class="text-gray-800 text-xl font-bold mb-4">
      Prix total : {{ totalPrice }} €
    </div>
    <div v-if="cartItems.length > 0" class="text-gray-800 text-xl font-bold mb-4">
      TVA ({{ tvaRate * 100 }}%) : {{ tvaAmount.toFixed(2) }} €
    </div>
    <div v-if="cartItems.length > 0" class="text-gray-800 text-xl font-bold mb-4">
      Total avec TVA : {{ totalPriceWithTva.toFixed(2) }} €
    </div>
    <button @click="emptyCart" :disabled="emptyingCart" class="bg-red-500 text-white px-4 py-2 rounded mt-4">
      {{ emptyingCart ? 'En cours...' : 'Vider le panier' }}
    </button>
    <button @click="placeOrder" class="bg-blue-500 text-white px-4 py-2 rounded mt-4 flex">Passer la commande <img class="ml-3" width="30" height="30" src="https://img.icons8.com/ios/50/FFFFFF/credit-card-front.png" alt="credit-card-front"/></button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      cartItems: [],
      emptyingCart: false,
      tvaRate: 0.20 // Exemple de taux de TVA de 20%
    }
  },
  async mounted() {
    await this.fetchCartItems();
  },
  computed: {
    totalPrice() {
      return this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    },
    tvaAmount() {
      return this.totalPrice * this.tvaRate;
    },
    totalPriceWithTva() {
      return this.totalPrice + this.tvaAmount;
    }
  },
  methods: {
    async fetchCartItems() {
      const response = await this.$axios.get(`/carts?userId=${this.$auth.user.id}`);
      this.cartItems = response.data.map((item, index) => ({ ...item, loading: false, uniqueKey: `${item.cartId}-${item.menuItemId}-${index}` }));
    },
    getImageUrl(imagePath) {
      return `https://apinfeat.aa-world.store${imagePath}`;
    },
    generateUniqueKey(item, index) {
      return `${item.cartId}-${item.menuItemId}-${index}`;
    },
    async removeItem(item) {
      item.loading = true;
      try {
        const payload = {
          userId: this.$auth.user.id,
          menuItemId: item.menuItemId,
          cartId: item.cartId
        };
        console.log('Payload:', payload);  // Ajoutez cette ligne pour vérifier les données
        await this.$axios.delete('/cart/item', { data: payload });
        await this.fetchCartItems();
      } catch (error) {
        console.error('Failed to remove item from cart', error);
      } finally {
        item.loading = false;
      }
    },
    async emptyCart() {
      this.emptyingCart = true;
      try {
        await this.$axios.post('/cart/empty', {
          userId: this.$auth.user.id
        });
        await this.fetchCartItems();
      } catch (error) {
        console.error('Failed to empty cart', error);
      } finally {
        this.emptyingCart = false;
      }
    },
    async placeOrder() {
      const totalAmountWithTva = this.totalPriceWithTva.toFixed(2); // use the fixed amount
      if (totalAmountWithTva == 0) {
        this.$toast.info('ajouter une commande !');
      } else {
        this.$router.push({ path: `/payment/${totalAmountWithTva}` });
      }
    }
  }
}
</script>

<style scoped>
.container {
  max-width: 800px;
}
</style>
