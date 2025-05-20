<template>
  <div class="container mx-auto p-4" v-if="$auth.loggedIn && $auth.user.roles.includes('ROLE_ADMIN')">
    <h1 class="text-3xl font-bold mb-4 text-white">Gestion du Menu Admin</h1>
    <button @click="showAddModal = true" class="bg-blue-500 text-white px-4 py-2 rounded mb-4">Ajouter un Élément de Menu</button>
    <div v-if="menuItems.length === 0">Aucun élément de menu disponible.</div>
    <div v-for="item in menuItems" :key="item.id" class="bg-white shadow-md rounded-lg p-4 mb-4">
      <div class="flex justify-between items-center sm:flex-row flex-col">
        <div class="flex-shrink-0">
          <img :src="getImageUrl(item.image_url)" alt="Image de l'élément de menu" class="w-32 h-32 object-cover rounded-md shadow-sm">
        </div>
        <div class="flex-grow ml-4">
          <h2 class="text-2xl font-semibold">{{ item.name }}</h2>
          <p>{{ item.description }}</p>
          <p class="text-lg font-bold">{{ item.price }} €</p>
          <p class="text-md">{{ item.category.title }}</p>
        </div>
        <div class="w-64 flex items-center justify-center">
          <button @click="editItem(item)" class="bg-yellow-500 text-white px-4 py-2 rounded mr-2">Modifier</button>
          <button @click="deleteItem(item.id)" class="bg-red-500 text-white px-4 py-2 rounded">Supprimer</button>
        </div>
      </div>
    </div>

    <!-- Modal Ajouter/Modifier -->
    <div v-if="showAddModal || showEditModal" class="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
      <div class="bg-white p-6 rounded shadow-lg w-full max-w-xl mx-4">
        <h2 class="text-2xl font-bold mb-4">{{ showEditModal ? 'Modifier l\'Élément de Menu' : 'Ajouter un Élément de Menu' }}</h2>
        <form @submit.prevent="showEditModal ? updateMenuItem() : createMenuItem()">
          <div class="mb-4">
            <label class="block text-gray-700">Nom</label>
            <input v-model="currentItem.name" type="text" class="w-full px-4 py-2 border rounded" />
          </div>
          <div class="mb-4">
            <label class="block text-gray-700">Description</label>
            <textarea v-model="currentItem.description" class="w-full px-4 py-2 border rounded" rows="4"></textarea>
          </div>
          <div class="mb-4">
            <label class="block text-gray-700">Prix</label>
            <input v-model="currentItem.price" type="text" pattern="[0-9]+([\.,][0-9]+)?" class="w-full px-4 py-2 border rounded" 
              placeholder="ex: 7,50 ou 7.50" 
              @input="validatePrice($event)" />
          </div>
          <div class="mb-4">
            <label class="block text-gray-700">Image</label>
            <img v-if="imagePreview" :src="imagePreview" alt="Aperçu" class="mt-2 w-full h-48 object-cover rounded" />
            <input @change="onFileChange" type="file" accept="image/*" class="w-full px-4 py-2 border rounded mt-2" />
          </div>
          <div class="mb-4">
            <label class="block text-gray-700">Catégorie</label>
            <select v-model="currentItem.category_id" class="w-full px-4 py-2 border rounded">
              <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.title }}</option>
            </select>
          </div>
          <div v-if="error" class="mb-4 text-red-500">{{ error }}</div>
          <div class="flex justify-end">
            <button type="button" @click="closeModal" class="bg-gray-500 text-white px-4 py-2 rounded mr-2">Annuler</button>
            <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded">{{ showEditModal ? 'Mettre à Jour' : 'Ajouter' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      menuItems: [],
      categories: [],
      showAddModal: false,
      showEditModal: false,
      currentItem: {
        id: null,
        name: '',
        description: '',
        price: '',
        image_url: '',
        category_id: null
      },
      selectedFile: null,
      error: '',
      imagePreview: null
    }
  },
  async mounted() {
    await this.fetchMenuItems();
    await this.fetchCategories();
  },
  methods: {
    async fetchMenuItems() {
      try {
        const response = await this.$axios.get('/menu');
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
    async fetchCategories() {
      try {
        const response = await this.$axios.get('/categories');
        this.categories = response.data;
      } catch (error) {
        console.error('Failed to fetch categories', error);
      }
    },
    async createMenuItem() {
      if (!this.selectedFile) {
        this.error = 'Veuillez sélectionner une image.';
        return;
      }

      const formData = {
        name: this.currentItem.name,
        description: this.currentItem.description,
        price: this.currentItem.price,
        image_url: '',
        category_id: this.currentItem.category_id
      };

      const reader = new FileReader();
      reader.onloadend = () => {
        formData.image_url = reader.result;
        this.submitFormData(formData);
      };
      reader.readAsDataURL(this.selectedFile);
    },
    async submitFormData(formData) {
      try {
        // Formater le prix avant l'envoi
        formData.price = this.formatPrice(formData.price);
        
        await this.$axios.post('/menu', formData, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        this.closeModal();
        await this.fetchMenuItems();
      } catch (error) {
        console.error(error);
      }
    },
    async updateMenuItem() {
      // Prepare formData without image_url by default
      let formData = {
        name: this.currentItem.name,
        description: this.currentItem.description,
        price: this.currentItem.price,
        category_id: this.currentItem.category_id
      };

      if (this.selectedFile) {
        const reader = new FileReader();
        reader.onloadend = () => {
          formData.image_url = reader.result;
          this.submitUpdateFormData(formData);
        };
        reader.readAsDataURL(this.selectedFile);
      } else {
        // Do not include image_url if no new image is selected
        this.submitUpdateFormData(formData);
      }
    },
    async submitUpdateFormData(formData) {
      try {
        // Formater le prix avant l'envoi
        formData.price = this.formatPrice(formData.price);
        
        await this.$axios.put(`/menu/${this.currentItem.id}`, formData, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        this.closeModal();
        await this.fetchMenuItems();
      } catch (error) {
        console.error(error);
      }
    },
    async deleteItem(id) {
      try {
        await this.$axios.delete(`/menu/${id}`);
        await this.fetchMenuItems();
      } catch (error) {
        console.error('Failed to delete item', error);
      }
    },
    editItem(item) {
      this.currentItem = { ...item, category_id: item.category.id };
      this.showEditModal = true;
      this.error = '';
      // Afficher l'aperçu de l'image existante lors de la modification
      this.imagePreview = item.image_url ? this.getImageUrl(item.image_url) : null;
    },
    closeModal() {
      this.showAddModal = false;
      this.showEditModal = false;
      this.currentItem = {
        id: null,
        name: '',
        description: '',
        price: '',
        image_url: '',
        category_id: null
      };
      this.selectedFile = null;
      this.error = '';
      this.imagePreview = null;
    },
    onFileChange(event) {
      this.selectedFile = event.target.files[0];
      if (this.selectedFile) {
        const reader = new FileReader();
        reader.onload = e => {
          this.imagePreview = e.target.result;
        };
        reader.readAsDataURL(this.selectedFile);
      } else {
        this.imagePreview = null;
      }
    },
    getImageUrl(imagePath) {
      return `https://apinfeat.aa-world.store${imagePath}`;
    },
    validatePrice(event) {
      // Ne pas modifier la saisie de l'utilisateur directement pour une meilleure expérience
      // Les deux formats (virgule ou point) sont acceptés grâce au pattern HTML
      
      // Vérifie si la valeur est valide
      const regex = /^[0-9]+([\.,][0-9]{0,2})?$/;
      if (!regex.test(event.target.value) && event.target.value !== '') {
        // Si la valeur n'est pas valide, afficher une erreur
        this.error = 'Format de prix invalide. Utilisez le format 7,50 ou 7.50';
      } else {
        // Si valide, effacer le message d'erreur
        this.error = '';
      }
    },
    // Pour la soumission, s'assurer que le format est correct
    formatPrice(price) {
      // Convertir la virgule en point pour le traitement JavaScript
      if (typeof price === 'string') {
        return price.replace(',', '.');
      }
      return price;
    }
  }
}
</script>

<style scoped>
.container {
  max-width: 800px;
}
</style>
