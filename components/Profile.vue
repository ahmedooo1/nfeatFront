<template>
  <div class="container mx-auto mt-8 p-4 md:p-6">
    <div class="bg-white shadow-lg rounded-xl p-6 md:p-8">
      <h3 class="text-2xl font-bold text-gray-800 mb-6 text-center">Mon Profil</h3>
      <div v-if="user" class="text-gray-900">
        <div class="mb-8 relative flex justify-center">
          <div class="relative w-32 h-32 rounded-full overflow-hidden bg-gray-100 ring-4 ring-blue-100">
            <img v-if="user.picture" :src="user.picture" alt="Photo de profil" class="w-full h-full object-cover">
            <div v-else class="w-full h-full flex items-center justify-center bg-blue-50 text-blue-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          
          <!-- Bouton + positionné exactement au bord du cercle -->
          <div class="absolute" style="right: calc(50% - 68px); bottom: 0;">
            <label for="picture-upload" class="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center cursor-pointer shadow-md transition-all duration-300 hover:bg-blue-700 transform translate-y-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </label>
          </div>
          <input id="picture-upload" type="file" @change="onFileChange" class="hidden" accept="image/*"/>
        </div>

        <h2 class="text-center text-xl font-bold text-gray-700 mb-8">Bienvenue, {{ user.name }}</h2>
        
        <div class="space-y-6">
          <div class="relative">
            <label class="text-sm font-medium text-gray-600 mb-1 block">Email</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <input v-model="user.email" type="email" placeholder="Votre email" class="pl-10 border border-gray-300 p-3 w-full rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" />
            </div>
          </div>
          
          <div class="relative">
            <label class="text-sm font-medium text-gray-600 mb-1 block">Nom</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input v-model="user.name" type="text" placeholder="Votre nom" class="pl-10 border border-gray-300 p-3 w-full rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" />
            </div>
          </div>
          
          <div class="relative">
            <label class="text-sm font-medium text-gray-600 mb-1 block">Nouveau mot de passe</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input v-model="newPassword" type="password" placeholder="Laisser vide pour ne pas changer" class="pl-10 border border-gray-300 p-3 w-full rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" />
            </div>
          </div>
        </div>

        <button @click="updateProfile" class="bg-blue-500 hover:bg-blue-600 text-white mt-8 w-full p-3 rounded-lg font-semibold shadow-md transition-all duration-300 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
          </svg>
          Mettre à jour mon profil
        </button>
        
        <p v-if="updateMessage" class="mt-4 text-center" :class="updateSuccess ? 'text-green-600' : 'text-red-600'">
          {{ updateMessage }}
        </p>
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
      picture: null,
      updateMessage: '',
      updateSuccess: false
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
      if (!file) return;
      
      // Vérifier si c'est une image
      if (!file.type.startsWith('image/')) {
        this.updateMessage = 'Veuillez sélectionner une image valide';
        this.updateSuccess = false;
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        this.picture = reader.result.split(',')[1]; // Get base64 part
        this.user.picture = reader.result; // Afficher un aperçu immédiat
      }
      reader.readAsDataURL(file);
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
        this.$toast.success('Profil mis à jour avec succès')
        this.updateMessage = 'Votre profil a été mis à jour avec succès!';
        this.updateSuccess = true;
        this.newPassword = ''; // Vider le champ de mot de passe
        await this.fetchUserProfile(); // Refresh profile data
      } catch (error) {
        console.error('Profile update failed:', error)
        this.updateMessage = 'La mise à jour du profil a échoué. Veuillez réessayer.';
        this.updateSuccess = false;
      }
    }
  }
}
</script>

<style scoped>
.container {
  max-width: 600px;  /* Augmenté de 500px à 600px pour élargir */
}
</style>
