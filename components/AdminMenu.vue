<template> 
  <div class="container mx-auto p-4">
    <h1 class="text-3xl font-bold mb-4 text-white">Gestion du Menu Administrateur</h1>
    <button @click="showAddModal = true" class="bg-blue-500 text-white px-4 py-2 rounded mb-4">Ajouter un �l�ment au Menu</button>
    <div v-if="menuItems.length === 0" class="text-white">Aucun �l�ment de menu disponible.</div>
    <div v-for="item in menuItems" :key="item.id" class="bg-white shadow-md rounded-lg p-4 mb-4">
      <div class="flex justify-between items-center">
        <div>
          <img :src="getImageUrl(item.image_url)" alt="Image de l'�l�ment du menu" class="w-32 h-32 object-cover rounded">
        </div>
        <div class="flex-grow ml-4">
          <h2 class="text-2xl font-semibold">{{ item.name }}</h2>
          <p>{{ item.description }}</p>
          <p class="text-lg font-bold">{{ item.price }} �</p>
        </div>
        <div class="w-[200px]">
          <button @click="editItem(item)" class="bg-yellow-500 text-white px-4 py-2 rounded mr-2">Modifier</button>
          <button @click="deleteItem(item.id)" class="bg-red-500 text-white px-4 py-2 rounded">Supprimer</button>
        </div>
      </div>
    </div>

    <!-- Modal Ajouter/Modifier -->
    <div v-if="showAddModal || showEditModal" class="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
      <div class="bg-white p-6 rounded shadow-lg w-96">
        <h2 class="text-2xl font-bold mb-4">{{ showEditModal ? 'Modifier un �l�ment du Menu' : 'Ajouter un �l�ment au Menu' }}</h2>
        <form @submit.prevent="showEditModal ? updateMenuItem() : createMenuItem()">
          <div class="mb-4">
            <label class="block text-gray-700">Nom</label>
            <input v-model="currentItem.name" type="text" class="w-full px-4 py-2 border rounded" />
          </div>
          <div class="mb-4">
            <label class="block text-gray-700">Description</label>
            <input v-model="currentItem.description" type="text" class="w-full px-4 py-2 border rounded" />
          </div>
          <div class="mb-4">
            <label class="block text-gray-700">Prix</label>
            <input v-model="currentItem.price" type="number" class="w-full px-4 py-2 border rounded" />
          </div>
          <div class="mb-4">
            <label class="block text-gray-700">Image</label>
            <input @change="onFileChange" type="file" class="w-full px-4 py-2 border rounded" />
          </div>
          <div class="flex justify-end">
            <button type="button" @click="closeModal" class="bg-gray-500 text-white px-4 py-2 rounded mr-2">Annuler</button>
            <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded">{{ showEditModal ? 'Mettre � Jour' : 'Ajouter' }}</button>
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
      showAddModal: false,
      showEditModal: false,
      currentItem: {
        id: null,
        name: '',
        description: '',
        price: '',
        image_url: ''
      },
      selectedFile: null
    }
  },
  async mounted() {
    await this.fetchMenuItems()
  },
  methods: {
    async fetchMenuItems() {
      const response = await this.$axios.get('/menu')
      this.menuItems = response.data
    },
    async createMenuItem() {
      const formData = new FormData()
      formData.append('name', this.currentItem.name)
      formData.append('description', this.currentItem.description)
      formData.append('price', this.currentItem.price)
      if (this.selectedFile) {
        formData.append('image_url', this.selectedFile)
      }

      await this.$axios.post('/menu', formData)
      this.closeModal()
      await this.fetchMenuItems()
      this.$toast.success('�l�ment ajout� avec succ�s!')
    },
    async updateMenuItem() {
      const formData = new FormData()
      formData.append('name', this.currentItem.name)
      formData.append('description', this.currentItem.description)
      formData.append('price', this.currentItem.price)
      if (this.selectedFile) {
        formData.append('image_url', this.selectedFile)
      }

      await this.$axios.put(`/menu/${this.currentItem.id}`, formData)
      this.closeModal()
      await this.fetchMenuItems()
      this.$toast.success('�l�ment mis � jour avec succ�s!')

    },
    async deleteItem(id) {
      await this.$axios.delete(`/menu/${id}`)
      await this.fetchMenuItems()
      this.$toast.success('�l�ment supprim� avec succ�s!')
    },
    editItem(item) {
      this.currentItem = { ...item }
      this.showEditModal = true
    },
    closeModal() {
      this.showAddModal = false,
      this.showEditModal = false,
      this.currentItem = {
        id: null,
        name: '',
        description: '',
        price: '',
        image_url: ''
      }
      this.selectedFile = null
    },
    onFileChange(event) {
      this.selectedFile = event.target.files[0]
    },
    getImageUrl(imagePath) {
  return `https://apinfeat.aaweb.fr${imagePath}`
    }
  }
}
</script>

<style scoped>
.container {
  max-width: 800px;
}
</style>
