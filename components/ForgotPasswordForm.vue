<template>
  <div>
    <h3 class="text-lg leading-6 font-medium text-white mb-4">Mot de passe oublié</h3>
    <div>
      <input v-model="email" type="email" placeholder="E-mail" class="border p-2 w-full mb-2 text-gray-800"/>
      <span v-if="errors.email" class="text-red-500 text-sm">{{ errors.email }}</span>
      <button @click="forgotPassword" class="bg-blue-400 hover:bg-blue-500 text-white p-2 w-full">Réinitialiser le mot de passe</button>
      <p class="mt-4 text-sm text-gray-300">
        Vous vous souvenez de votre mot de passe ?
        <a @click.prevent="$emit('switch-tab', 'login')" href="#" class="text-blue-400">Connectez-vous ici</a>.
      </p>
      <p class="mt-2 text-sm text-gray-300">
        Vous n'avez pas de compte ?
        <a @click.prevent="$emit('switch-tab', 'register')" href="#" class="text-blue-400">Inscrivez-vous ici</a>.
      </p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      email: '',
      errors: {}
    }
  },
  methods: {
    validate() {
      this.errors = {}
      if (!this.email) this.errors.email = 'L\'e-mail est requis.'
      return Object.keys(this.errors).length === 0
    },
    async forgotPassword() {
      if (!this.validate()) return
      try {
        const response = await this.$axios.post('/request-reset-password', { email: this.email })
        console.log('E-mail de réinitialisation du mot de passe envoyé :', response.data)
        this.$toast.success('E-mail de réinitialisation du mot de passe envoyé ')
        this.$emit('close')
      } catch (error) {
        console.error('Password reset failed:', error)
      }
    }
  }
}
</script>
<style scoped>
 input {
  border-radius: 5px;
}
button {
  border-radius: 5px;
}
</style>
