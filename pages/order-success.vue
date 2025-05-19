<template>
  <div class="container mx-auto mt-8 p-4 max-w-2xl text-white">
    <div class="bg-gray-900 rounded-lg shadow-xl p-8 mb-8">
      <div class="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100 mb-6">
        <svg class="h-16 w-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
      </div>
      
      <h2 class="text-2xl font-bold mb-4 text-center">Paiement Réussi</h2>
      <p class="text-center mb-2">Merci pour votre réservation !</p>
      <p class="text-center mb-2">Votre commande est en cours de préparation...</p>
      <p class="text-center mb-4">On vous attend, à bientôt !</p>
      
      <!-- Bouton pour télécharger le reçu PDF -->
      <div class="flex justify-center">
        <button 
          @click="downloadReceipt" 
          :disabled="!canDownloadReceipt || isGeneratingPdf"
          class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg flex items-center transition duration-200">
          <svg class="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z"/>
          </svg>
          {{ isGeneratingPdf ? 'Génération du reçu...' : (canDownloadReceipt ? 'Télécharger le reçu PDF' : 'Reçu non disponible') }}
        </button>
      </div>
      
      <div class="mt-6 text-center">
        <nuxt-link to="/" class="text-blue-400 hover:text-blue-300 flex items-center justify-center">
          <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"></path>
          </svg>
          Retour à l'accueil
        </nuxt-link>
      </div>
    </div>
  </div>
</template>

<script>
import receiptService from '~/services/receiptService';

export default {
  name: "OrderSuccess",
  layout: 'simple',
  data() {
    return {
      orderData: null,
      orderItems: [],
      paymentId: '',
      canDownloadReceipt: false,
      isGeneratingPdf: false
    }
  },
  mounted() {
    try {
      const orderDataStr = localStorage.getItem('lastOrderData');
      const orderItemsStr = localStorage.getItem('lastOrderItems');
      const paymentId = localStorage.getItem('lastPaymentId');
      if (orderDataStr && orderItemsStr && paymentId) {
        this.orderData = JSON.parse(orderDataStr);
        this.orderItems = JSON.parse(orderItemsStr);
        this.paymentId = paymentId;
        this.canDownloadReceipt = true;
      } else {
        console.warn('Some data for receipt generation is missing');
      }
    } catch (error) {
      console.error('Error loading receipt data:', error);
    }
  },
  methods: {
    async downloadReceipt() {
      if (!this.canDownloadReceipt) {
        this.$toast && this.$toast.error("Données de reçu non disponibles");
        return;
      }
      
      if (this.isGeneratingPdf) {
        return; // Éviter les clics multiples pendant la génération
      }
      
      this.isGeneratingPdf = true;
      
      try {
        const userData = {
          name: this.$auth.user ? (this.$auth.user.firstname + ' ' + this.$auth.user.lastname) : 'Client',
          email: this.$auth.user ? this.$auth.user.email : 'Non spécifié',
          phone: this.$auth.user && this.$auth.user.phone ? this.$auth.user.phone : 'Non spécifié',
          address: this.$auth.user && this.$auth.user.address ? this.$auth.user.address : 'Non spécifiée'
        };
        
        // Appel asynchrone à la méthode generateReceipt
        const pdfDoc = await receiptService.generateReceipt(
          this.orderData,
          this.orderItems,
          userData,
          this.paymentId
        );
        
        // Téléchargement du PDF
        receiptService.downloadReceipt(pdfDoc, `nfeat-recu-${this.paymentId.slice(-8)}.pdf`);
        
        // Message de confirmation optionnel
        this.$toast && this.$toast.success("Votre reçu a été téléchargé");
      } catch (error) {
        console.error('Error generating receipt:', error);
        this.$toast && this.$toast.error("Erreur lors de la génération du reçu: " + error.message);
      } finally {
        this.isGeneratingPdf = false;
      }
    }
  }
}
</script>

<style scoped>
button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
