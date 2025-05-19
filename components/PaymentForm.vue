<template>
  <div class="container mx-auto p-4">
    <h2 class="text-2xl font-bold mb-4">Complete Your Payment</h2>
    <form @submit.prevent="handleSubmit">
      <div id="card-element" class="mb-4"></div>
      <button class="bg-blue-500 text-white px-4 py-2 rounded" :disabled="processing">
        {{ processing ? 'Processing...' : 'Pay Now' }}
      </button>
    </form>
    <p v-if="error" class="text-red-500">{{ error }}</p>
  </div>
</template>

<script>
import { loadStripe } from '@stripe/stripe-js';

export default {
  data() {
    return {
      stripe: null,
      cardElement: null,
      clientSecret: '',
      processing: false,
      error: ''
    };
  },
  async mounted() {
    this.stripe = await loadStripe('pk_test_51NAd2mCCNM9KNgubo0Z8AcnFjXA55XhZdi7MTdXRNjuCWDPchNKBd6mTy7mCRXaT6bHSRT6xcTSEfnlMzE5J68m400ScKGFHko');
    const elements = this.stripe.elements();
    this.cardElement = elements.create('card');
    this.cardElement.mount('#card-element');

    // Fetch the client secret from your backend
    const response = await this.$axios.post('/payment', { amount: this.$route.params.amount });
    this.clientSecret = response.data.clientSecret;
  },
  methods: {
    async handleSubmit() {
      this.processing = true;
      this.error = '';
      const { error, paymentIntent } = await this.stripe.confirmCardPayment(this.clientSecret, {
        payment_method: {
          card: this.cardElement
        }
      });

      if (error) {
        this.error = error.message;
        this.processing = false;
      } else if (paymentIntent.status === 'succeeded') {
        // Handle successful payment here
        // Enregistrer les détails de la commande dans localStorage
        localStorage.setItem('lastOrderData', JSON.stringify(this.orderData));
        localStorage.setItem('lastOrderItems', JSON.stringify(this.orderItems));
        localStorage.setItem('lastPaymentId', paymentIntent.id);
        
        // Enregistrer la commande en base de données
        await this.saveOrder(paymentIntent.id);
        
        // Rediriger vers la page de succès
        this.$router.push('/order-success');
      }
    }
  }
};
</script>

<style scoped>
/* Add your styles here */
</style>
