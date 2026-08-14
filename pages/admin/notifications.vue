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
import { notifBus } from '~/plugins/mercureNotifications.client.js';

export default {
  data() {
    return {
      notifications: [],
      loading: true,
      page: 1,
      limit: 10,
      total: 0
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.total / this.limit);
    },
    liveConnected() {
      return this.$store.state.notifications.liveConnected;
    }
  },
  async mounted() {
    await this.fetchNotifications();
    if (process.client) {
      notifBus.$on('new-notification', this.onLiveNotification);
    }
  },
  beforeDestroy() {
    if (process.client) {
      notifBus.$off('new-notification', this.onLiveNotification);
    }
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

        // The global badge is a "you have unread" signal; viewing page 1
        // (the newest items) is what counts as having seen them.
        if (this.page === 1) {
          const latestId = this.notifications[0]?.id ?? null;
          this.$store.commit('notifications/RESET_UNREAD', latestId);
        }
      } catch (error) {
        console.error('Failed to load notifications', error);
      } finally {
        this.loading = false;
      }
    },
    onLiveNotification(raw) {
      // Only splice into the visible list while looking at the first page -
      // inserting on page 2+ would silently shift what's on screen.
      if (this.page !== 1) return;
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
      if (this.notifications.length > this.limit) {
        this.notifications.pop();
      }
      this.total += 1;
      this.$store.commit('notifications/RESET_UNREAD', raw.id);
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
        const dateObj = typeof dateString === 'string' ? new Date(dateString) : dateString;

        if (isNaN(dateObj.getTime())) {
          console.error('Date invalide:', dateString);
          return dateString;
        }

        // Intl handles the DST transition dates correctly on its own (they
        // shift slightly year to year) instead of a hand-rolled "last Sunday
        // of March/October" approximation.
        const parts = new Intl.DateTimeFormat('fr-FR', {
          timeZone: 'Europe/Paris',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }).formatToParts(dateObj).reduce((acc, part) => {
          acc[part.type] = part.value;
          return acc;
        }, {});

        return `${parts.day}/${parts.month}/${parts.year} ${parts.hour}:${parts.minute}`;
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
