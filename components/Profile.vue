<template>
  <div class="container mx-auto mt-8 p-4 max-w-md">
    <div class="bg-white shadow-md rounded-lg p-6">
      <h3 class="text-2xl font-semibold text-gray-800 mb-4 text-center">Profil</h3>
      <div v-if="user" class="text-gray-900">
        <div v-if="user.picture" class="mb-4">
          <img :src="user.picture" alt="Photo de profil" class="w-32 h-32 object-cover rounded-full mx-auto shadow-md">
        </div>
        <h2 class="text-center text-xl font-bold text-gray-700 mb-4">Salut, {{ user.name }}</h2>
        <div class="space-y-4">
          <input v-model="user.email" type="email" placeholder="E-mail" class="border p-3 w-full rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input v-model="user.name" type="text" placeholder="Nom" class="border p-3 w-full rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input v-model="newPassword" type="password" placeholder="Nouveau mot de passe" class="border p-3 w-full rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input type="file" @change="onFileChange" class="border p-3 w-full rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <button @click="updateProfile" class="bg-blue-500 text-white mt-6 w-full p-3 rounded-lg font-semibold shadow-md hover:bg-blue-600 transition duration-300">Mettre à jour le profil</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      user: null,
      newPassword: '',
      picture: null
    }
  },
  async mounted() {
    await this.fetchUserProfile()
  },
  methods: {
    async fetchUserProfile() {
      try {
        const response = await this.$axios.post('/user/getcurrent')
        console.log('User profile:', response.data)
        if (response.data.picture) {
          response.data.picture = `data:image/jpeg;base64,${response.data.picture}`;
        }
        this.user = response.data
      } catch (error) {
        console.error('Error fetching user profile:', error)
      }
    },
    onFileChange(event) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        this.picture = reader.result.split(',')[1]; // Get base64 part
      }
      if (file) {
        reader.readAsDataURL(file);
      }
    },
    async updateProfile() {
      try {
        const payload = {
          email: this.user.email,
          name: this.user.name,
          plainPassword: this.newPassword || undefined,
          picture: this.picture || undefined
        }
        const response = await this.$axios.post('/user/edit', payload)
        this.$toast.success('Profile updated successfully')
        await this.fetchUserProfile(); // Refresh profile data
      } catch (error) {
        console.error('Profile update failed:', error)
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
