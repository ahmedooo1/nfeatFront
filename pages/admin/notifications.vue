<template>
  <div class="container mx-auto p-4" v-if="$auth.loggedIn && $auth.user.roles.includes('ROLE_ADMIN')">
    <div class="flex items-center gap-3 mb-6">
      <h2 class="text-3xl font-bold text-gray-800">Notifications de Commandes</h2>
      <span
        class="w-2.5 h-2.5 rounded-full"
        :class="liveConnected ? 'bg-green-500' : 'bg-gray-300'"
        :title="liveConnected ? 'Temps réel actif' : 'Temps réel indisponible (repli sur actualisation périodique)'"
      ></span>
    </div>
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
                :class="notification.isNew ? 'bg-green-100 border-l-4 border-green-400' : getRowColorClass(index)"
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
const MERCURE_TOPIC = 'https://apinfeat.aaweb.fr/orders/notifications';
const MERCURE_PUBLIC_URL = 'https://apinfeat.aaweb.fr/.well-known/mercure';

export default {
  data() {
    return {
      notifications: [],
      loading: true,
      page: 1,
      limit: 10,
      total: 0,
      audioNotification: null,
      eventSource: null,
      liveConnected: false,
      pollInterval: null
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.total / this.limit);
    }
  },
  async mounted() {
    await this.fetchNotifications();
    // Real-time push handles new orders instantly; this is just a safety-net
    // reconciliation in case a push is missed (connection drop, tab backgrounded).
    this.pollInterval = setInterval(this.fetchNotifications, 60000);
    if (process.client) {
      this.audioNotification = new Audio('/assets/sounds/notif.mp3');
    }
    await this.connectLiveNotifications();
  },
  beforeDestroy() {
    if (this.pollInterval) clearInterval(this.pollInterval);
    if (this.eventSource) this.eventSource.close();
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
            isNew: false
          };
        });
        this.total = response.data.total;
      } catch (error) {
        console.error('Failed to load notifications', error);
      } finally {
        this.loading = false;
      }
    },
    async connectLiveNotifications() {
      try {
        // Admin-gated endpoint: sets the mercureAuthorization cookie the hub
        // needs to authorize this subscription (payload has customer PII).
        await this.$axios.get('/admin/mercure-token', { withCredentials: true });
      } catch (error) {
        console.error('Failed to obtain Mercure subscriber token, falling back to polling only', error);
        return;
      }

      const url = `${MERCURE_PUBLIC_URL}?topic=${encodeURIComponent(MERCURE_TOPIC)}`;
      this.eventSource = new EventSource(url, { withCredentials: true });

      this.eventSource.onopen = () => {
        this.liveConnected = true;
      };

      this.eventSource.onmessage = (event) => {
        let raw;
        try {
          raw = JSON.parse(event.data);
        } catch (error) {
          console.error('Invalid notification payload', error);
          return;
        }

        if (this.notifications.some(n => n.id === raw.id)) return;

        const details = this.parseDetails(raw.details);
        this.notifications.unshift({
          id: raw.id,
          user: raw.user,
          details: raw.details,
          commandNames: details.commandNames.join(', '),
          totalQuantity: details.totalQuantity,
          totalPrice: details.totalPrice,
          createdAt: this.formatToParisTimezone(raw.createdAt),
          isNew: true
        });
        this.total += 1;

        if (this.audioNotification) {
          this.audioNotification.play().catch(() => {});
        }
        this.$toast.success(`Nouvelle commande de ${raw.user.name}`);
      };

      this.eventSource.onerror = () => {
        // Native EventSource retries the connection automatically; this just
        // reflects connection state in the UI indicator.
        this.liveConnected = false;
      };
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
