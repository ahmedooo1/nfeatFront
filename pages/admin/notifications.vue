<template>
  <div class="container mx-auto p-4" v-if="$auth.loggedIn && $auth.user.roles.includes('ROLE_ADMIN')">
    <h2 class="text-3xl font-bold mb-6 text-gray-800">Notifications de Commandes</h2>
    <div v-if="loading" class="text-center text-gray-600">Chargement...</div>
    <div v-if="!loading && notifications.length === 0" class="text-center text-gray-600">Aucune notification trouvée.</div>
    <div v-if="!loading && notifications.length > 0">
      <div class="overflow-x-auto bg-white shadow-md rounded-lg">
        <table class="min-w-full leading-normal">
          <thead>
            <tr>
              <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nom de l'Utilisateur</th>
              <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email de l'Utilisateur</th>
              <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nom de Commande</th>
              <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Quantité Totale</th>
              <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Prix Total</th>
              <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(notification, index) in notifications" :key="notification.id" 
                :class="getRowColorClass(index)" 
                class="hover:bg-opacity-80 transition duration-200 ease-in-out">
              <td class="px-5 py-5 border-b border-gray-200 text-sm">{{ notification.user.name }}</td>
              <td class="px-5 py-5 border-b border-gray-200 text-sm">{{ notification.user.email }}</td>
              <td class="px-5 py-5 border-b border-gray-200 text-sm">{{ notification.commandNames }}</td>
              <td class="px-5 py-5 border-b border-gray-200 text-sm">{{ notification.totalQuantity }}</td>
              <td class="px-5 py-5 border-b border-gray-200 text-sm">{{ notification.totalPrice }} €</td>
              <td class="px-5 py-5 border-b border-gray-200 text-sm">
                <div class="flex items-center">
                  <span>{{ notification.createdAt }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="flex justify-between items-center mt-6">
        <button @click="prevPage" :disabled="page === 1" class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-l disabled:opacity-50">
          Précédent
        </button>
        <span class="text-gray-600">Page {{ page }} sur {{ totalPages }}</span>
        <button @click="nextPage" :disabled="page === totalPages" class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-r disabled:opacity-50">
          Suivant
        </button>
      </div>
    </div>
    <div class="mt-6 flex flex-wrap gap-2">
      <div class="flex items-center">
        <div class="w-4 h-4 bg-green-100 mr-2 border border-green-200"></div>
        <span class="text-xs text-gray-600">Plus récente</span>
      </div>
      <div class="flex items-center">
        <div class="w-4 h-4 bg-blue-50 mr-2 border border-blue-100"></div>
        <span class="text-xs text-gray-600">Récente</span>
      </div>
      <div class="flex items-center">
        <div class="w-4 h-4 bg-purple-50 mr-2 border border-purple-100"></div>
        <span class="text-xs text-gray-600">Moyenne</span>
      </div>
      <div class="flex items-center">
        <div class="w-4 h-4 bg-amber-50 mr-2 border border-amber-100"></div>
        <span class="text-xs text-gray-600">Moins récente</span>
      </div>
      <div class="flex items-center">
        <div class="w-4 h-4 bg-gray-50 mr-2 border border-gray-100"></div>
        <span class="text-xs text-gray-600">Ancienne</span>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'; // Assurez-vous que axios est importé

export default {
  data() {
    return {
      notifications: [],
      notificationService: null, // Assurez-vous que cet objet est correctement initialisé
      loading: true,
      page: 1,
      limit: 10,
      total: 0,
      audioNotification: null,
      eventSource: null
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.total / this.limit);
    }
  },
  async mounted() {
    await this.fetchNotifications();
    this.interval = setInterval(this.fetchNotifications, 10000); // Set interval to refresh every 15 seconds
    this.listenForNotifications();
  },
  methods: {
    async fetchNotifications() {
      this.loading = true;
      try {
        const response = await this.$axios.get('/admin/notifications', {
          params: {
            page: this.page,
            limit: this.limit
          }
        });
        this.notifications = response.data.data.map(notification => {
          const details = this.parseDetails(notification.details);
          return {
            ...notification,
            commandNames: details.commandNames.join(', '),
            totalQuantity: details.totalQuantity,
            totalPrice: details.totalPrice,
            createdAt: this.formatToParisTimezone(notification.createdAt),
            isNew: false // Propriété pour tracker les nouvelles notifications
          };
        });
        this.total = response.data.total;
      } catch (error) {
        console.error('Failed to load notifications', error);
      } finally {
        this.loading = false;
      }
    },
    listenForNotifications() {
      // Assurez-vous que notificationService est bien initialisé
      if (!this.notificationService) {
        console.error('notificationService is not initialized');
        return;
      }

      try {
        this.notificationService.on('new-notification', (notification) => {
          this.notifications.push(notification);
        });
      } catch (error) {
        console.error('Erreur lors de l\'écoute des notifications:', error);
      }
    },
    parseDetails(details) {
      const items = details.split(', ');
      let commandNames = [];
      let totalQuantity = 0;
      let totalPrice = 0;

      items.forEach(item => {
        const matches = item.match(/(.+?) \(Quantité: (\d+)\) - (\d+\.\d{2}) €/);
        if (matches) {
          commandNames.push(`${matches[1]} (Quantité: ${matches[2]})`);
          totalQuantity += parseInt(matches[2], 10);
          totalPrice += parseFloat(matches[3]);
        }
      });

      return { commandNames, totalQuantity, totalPrice };
    },
    formatToParisTimezone(dateString) {
      try {
        // Si la date est déjà un objet Date
        let dateObj = dateString;
        if (typeof dateString === 'string') {
          dateObj = new Date(dateString);
        }

        // Vérifier si la date est valide
        if (isNaN(dateObj.getTime())) {
          console.error('Date invalide:', dateString);
          return dateString;
        }

        // Déterminer si la date est en heure d'été ou d'hiver en France
        // En France, le changement d'heure a lieu:
        // - Le dernier dimanche de mars (passage à l'heure d'été: UTC+2)
        // - Le dernier dimanche d'octobre (passage à l'heure d'hiver: UTC+1)
        
        // Année de la date
        const year = dateObj.getFullYear();
        
        // Dernier dimanche de mars (passage à l'heure d'été)
        const marchDate = new Date(year, 2, 31); // 31 mars
        while (marchDate.getDay() !== 0) { // Tant que ce n'est pas un dimanche
          marchDate.setDate(marchDate.getDate() - 1);
        }
        
        // Dernier dimanche d'octobre (passage à l'heure d'hiver)
        const octoberDate = new Date(year, 9, 31); // 31 octobre
        while (octoberDate.getDay() !== 0) { // Tant que ce n'est pas un dimanche
          octoberDate.setDate(octoberDate.getDate() - 1);
        }
        
        // Déterminer si la date est en heure d'été ou d'hiver
        const isSummerTime = dateObj >= marchDate && dateObj < octoberDate;
        
        // Appliquer le décalage horaire approprié
        // UTC+2 pour l'heure d'été, UTC+1 pour l'heure d'hiver
        const offset = isSummerTime ? 2 : 1;
        
        // Appliquer le décalage horaire
        const hours = dateObj.getHours() + offset;
        const minutes = dateObj.getMinutes();
        const day = dateObj.getDate();
        const month = dateObj.getMonth() + 1;
        const fullYear = dateObj.getFullYear();

        // Gérer le débordement des heures (si hours > 23)
        let adjustedHours = hours;
        let adjustedDay = day;
        let adjustedMonth = month;
        let adjustedYear = fullYear;
        
        if (hours >= 24) {
          adjustedHours = hours - 24;
          
          // Créer une nouvelle date pour gérer correctement le changement de jour/mois/année
          const nextDay = new Date(dateObj);
          nextDay.setDate(nextDay.getDate() + 1);
          
          adjustedDay = nextDay.getDate();
          adjustedMonth = nextDay.getMonth() + 1;
          adjustedYear = nextDay.getFullYear();
        }

        // Formater la date avec l'heure correcte de Paris
        return `${adjustedDay.toString().padStart(2, '0')}/${adjustedMonth.toString().padStart(2, '0')}/${adjustedYear} ${adjustedHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      } catch (error) {
        console.error('Erreur lors du formatage de la date:', error);
        return dateString;
      }
    },
    async prevPage() {
      if (this.page > 1) {
        this.page--;
        await this.fetchNotifications();
      }
    },
    async nextPage() {
      if (this.page < this.totalPages) {
        this.page++;
        await this.fetchNotifications();
      }
    },
    getRowColorClass(index) {
      // Coloration selon la récence (index)
      const colorClasses = [
        'bg-green-100 border-l-4 border-green-400', // Plus récente
        'bg-blue-50 border-l-4 border-blue-300',    // Récente
        'bg-purple-50 border-l-4 border-purple-300', // Moyenne
        'bg-amber-50 border-l-4 border-amber-300',  // Moins récente
        'bg-gray-50 border-l-4 border-gray-300'     // Ancienne
      ];
      
      // Si l'index est inférieur à la longueur du tableau, on utilise cette couleur
      if (index < colorClasses.length) {
        return colorClasses[index];
      }
      
      // Sinon, on utilise la dernière couleur (ancienne)
      return colorClasses[colorClasses.length - 1];
    },
  }
};
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: auto;
}

/* Définition des styles pour les nouvelles notifications (animations) */
@keyframes pulseBackground {
  0% { box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.4); }
  50% { box-shadow: 0 0 0 10px rgba(52, 211, 153, 0); }
  100% { box-shadow: 0 0 0 0 rgba(52, 211, 153, 0); }
}

.bg-green-100 {
  animation: pulseBackground 2s infinite;
}

/* Transitions douces pour les changements de couleur */
tr {
  transition: background-color 0.3s ease, box-shadow 0.3s ease, border-left 0.3s ease;
}
</style>
