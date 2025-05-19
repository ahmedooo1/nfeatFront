<template>
  <div class="min-w-screen min-h-screen bg-gray-200 flex items-center justify-center px-5 pb-10 pt-16">
    <div class="w-full mx-auto rounded-lg bg-white shadow-lg p-5 text-gray-700" style="max-width: 600px">
      <div class="w-full pt-1 pb-5">
        <div class="bg-indigo-500 text-white overflow-hidden rounded-full w-20 h-20 -mt-16 mx-auto shadow-lg flex justify-center items-center">
          <i class="mdi mdi-credit-card-outline text-3xl"></i>
        </div>
      </div>
      <div class="mb-10">
        <h1 class="text-center font-bold text-xl uppercase">Informations de paiement sécurisé</h1>
      </div>
      <div class="mb-10">
        <p class="text-center font-bold text-lg">Montant total : {{ totalAmountWithTva.toFixed(2) }} €</p>
      </div>
      <form @submit.prevent="handleSubmit">
        <div class="mb-3 flex -mx-2">
          <div class="px-2">
            <label for="type1" class="flex items-center cursor-pointer">
              <input type="radio" class="form-radio h-5 w-5 text-indigo-500" name="type" id="type1" checked>
              <img src="https://leadershipmemphis.org/wp-content/uploads/2020/08/780370.png" class="h-8 ml-3">
            </label>
          </div>
          <div class="px-2">
            <label for="type2" class="flex items-center cursor-pointer">
              <input type="radio" class="form-radio h-5 w-5 text-indigo-500" name="type" id="type2">
              <img src="https://www.sketchappsources.com/resources/source-image/PayPalCard.png" class="h-8 ml-3">
            </label>
          </div>
        </div>
        <div class="mb-3">
          <label class="font-bold text-sm mb-2 ml-1">Nom sur la carte</label>
          <div>
            <input class="w-full px-3 py-2 mb-1 border-2 border-gray-200 rounded-md focus:outline-none focus:border-indigo-500 transition-colors" v-model="cardholderName" placeholder="John Smith" type="text"/>
          </div>
        </div>
        <div class="mb-3">
          <label class="font-bold text-sm mb-2 ml-1">Numéro de carte</label>
          <div>
            <div id="card-element" class="w-full px-3 py-2 mb-1 border-2 border-gray-200 rounded-md focus:outline-none focus:border-indigo-500 transition-colors"></div>
          </div>
        </div>
        <div class="mb-3 -mx-2 flex items-end"></div>
        <div class="mb-10">
          <button class="block w-full max-w-xs mx-auto bg-indigo-500 hover:bg-indigo-700 focus:bg-indigo-700 text-white rounded-lg px-3 py-3 font-semibold" :disabled="processing">
            <i class="mdi mdi-lock-outline mr-1"></i> {{ processing ? 'Traitement...' : 'PAYER MAINTENANT' }}
          </button>
        </div>
      </form>
      <p v-if="error" class="text-red-500 mt-4 text-center">{{ error }}</p>
    </div>
  </div>
</template>

<script>
import { loadStripe } from '@stripe/stripe-js';

export default {
  data() {
    return {
      stripe: null,
      cardElement: null,
      cardholderName: '',
      clientSecret: '',
      processing: false,
      error: ''
    };
  },
  computed: {
    totalAmountWithTva() {
      return parseFloat(this.$route.params.amount);
    }
  },
  async mounted() {
    this.stripe = await loadStripe('pk_test_51NAd2mCCNM9KNgubo0Z8AcnFjXA55XhZdi7MTdXRNjuCWDPchNKBd6mTy7mCRXaT6bHSRT6xcTSEfnlMzE5J68m400ScKGFHko');
    const elements = this.stripe.elements();
    this.cardElement = elements.create('card');
    this.cardElement.mount('#card-element');

    try {
      const response = await this.$axios.post('/payment', { amount: this.totalAmountWithTva * 100 });
      this.clientSecret = response.data.clientSecret;
      console.log('Client Secret:', this.clientSecret); // Ajout de la vérification du client secret
    } catch (error) {
      console.error('Failed to create payment intent:', error);
      this.error = 'Failed to initialize payment. Please try again.';
    }
  },
  methods: {
    async handleSubmit() {
      this.processing = true;
      this.error = '';
      if (!this.clientSecret) {
        this.error = 'Payment initiation failed. Please try again.';
        this.processing = false;
        return;
      }

      const { error, paymentIntent } = await this.stripe.confirmCardPayment(this.clientSecret, {
        payment_method: {
          card: this.cardElement,
          billing_details: {
            name: this.cardholderName
          }
        }
      });

      if (error) {
        this.error = error.message;
        this.processing = false;
      } else if (paymentIntent.status === 'succeeded') {
        try {
          // Stockage des données pour le reçu PDF
          const cartResponse = await this.$axios.get(`/carts?userId=${this.$auth.user.id}`);
          const orderItems = cartResponse.data;
          
          // Calculer les totaux pour la commande
          const totalPriceWithTva = this.totalAmountWithTva;
          const tvaRate = 0.20; // 20% TVA
          const totalPrice = totalPriceWithTva / (1 + tvaRate);
          const tvaAmount = totalPriceWithTva - totalPrice;
          
          // Préparer les données de la commande
          const orderData = {
            totalPriceWithTva,
            totalPrice,
            tvaAmount,
            tvaRate
          };
          
          // Sauvegarder dans localStorage pour le reçu PDF
          localStorage.setItem('lastOrderData', JSON.stringify(orderData));
          localStorage.setItem('lastOrderItems', JSON.stringify(orderItems));
          localStorage.setItem('lastPaymentId', paymentIntent.id);
          
          // Corriger l'URL en ajoutant /api/ dans le chemin
          await this.$axios.post('/orders', { 
            userId: this.$auth.user.id,
            paymentId: paymentIntent.id,
            amount: this.totalAmountWithTva,
            items: orderItems
          });
          
          await this.emptyCart();
          this.$router.push('/order-success');
        } catch (error) {
          console.error('Failed to add order and notify admin:', error);
          this.error = 'Failed to process the order. Please try again.';
          this.processing = false;
        }
      }
    },

    async emptyCart() {
      const userId = this.$auth.user.id;
      try {
        await this.$axios.post('/cart/empty', { userId });
      } catch (error) {
        console.error('Failed to empty cart:', error);
      }
    }
  }
};
</script>

<style scoped>
@import url(https://cdnjs.cloudflare.com/ajax/libs/MaterialDesign-Webfont/5.3.45/css/materialdesignicons.min.css);

.form-radio {
  -webkit-appearance: none;
     -moz-appearance: none;
          appearance: none;

  display: inline-block;
  vertical-align: middle;
  background-origin: border-box;
  -webkit-user-select: none;
     -moz-user-select: none;
      -ms-user-select: none;
          user-select: none;
  flex-shrink: 0;
  border-radius: 100%;
  border-width: 2px;
}

.form-radio:checked {
  background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3ccircle cx='8' cy='8' r='3'/%3e%3c/svg%3e");
  border-color: transparent;
  background-color: currentColor;
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
}

@media not print {
  .form-radio::-ms-check {
    border-width: 1px;
    color: transparent;
    background: inherit;
    border-color: inherit;
    border-radius: inherit;
  }
}

.form-radio:focus {
  outline: none;
}

.form-select {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23a0aec0'%3e%3cpath d='M15.3 9.3a1 1 0 0 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 1.4-1.4l3.3 3.29 3.3-3.3z'/%3e%3c/svg%3e");
  -webkit-appearance: none;
     -moz-appearance: none;
          appearance: none;

  background-repeat: no-repeat;
  padding-top: 0.5rem;
  padding-right: 2.5rem;
  padding-bottom: 0.5rem;
  padding-left: 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
  background-position: right 0.5rem center;
  background-size: 1.5em 1.5em;
}

.form-select::-ms-expand {
  color: #a0aec0;
  border: none;
}

@media not print {
  .form-select::-ms-expand {
    display: none;
  }
}

@media print and (-ms-high-contrast: active), print and (-ms-high-contrast: none) {
  .form-select {
    padding-right: 0.75rem;
  }
}
</style>
