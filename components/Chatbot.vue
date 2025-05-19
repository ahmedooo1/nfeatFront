<template>
  <div class="chatbot-container">
    <!-- Bouton du chatbot -->
    <div class="chat-launcher" @click="toggleChat">
      <img src="/assets/images/NF-EAT-transparent.png" alt="Chat" class="chat-icon" v-if="!isChatOpen">
      <span class="close-icon" v-if="isChatOpen">×</span>
      <div class="notification-badge" v-if="!isChatOpen && hasNewMessage">1</div>
    </div>
    
    <!-- Fenêtre du chat -->
    <div class="chat-window" v-if="isChatOpen">
      <div class="chat-header">
        <div class="header-title">NF-EAT Assistant</div>
      </div>
      
      <!-- Messages -->
      <div class="chat-messages" ref="messagesContainer">
        <div v-for="(message, index) in messages" :key="index"
             :class="['message', message.type === 'bot' ? 'bot-message' : 'user-message']">
          <!-- Message texte standard -->
          <div v-if="!message.isHtml">{{ message.text }}</div>
          
          <!-- Message HTML (pour les liens) -->
          <div v-else v-html="message.text"></div>
          
          <!-- Horodatage -->
          <div class="message-time" v-if="message.time">{{ message.time }}</div>
        </div>
      </div>
      
      <!-- Zone des suggestions -->
      <div class="suggestion-container" v-if="suggestions.length > 0">
        <div 
          v-for="(suggestion, index) in suggestions" 
          :key="index"
          class="suggestion-chip"
          @click="selectSuggestion(suggestion)">
          {{ suggestion.text }}
        </div>
      </div>
      
      <!-- Zone de saisie -->
      <div class="chat-input">
        <input 
          v-model="newMessage" 
          @keyup.enter="sendMessage"
          placeholder="Ou écrivez votre question..."
          type="text"
        >
        <button @click="sendMessage" aria-label="Envoyer">
          <i class="send-icon">&#10147;</i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Chatbot',
  data() {
    return {
      isChatOpen: false,
      messages: [],
      suggestions: [],
      newMessage: '',
      hasNewMessage: false,
      hasShownWelcome: false,
      // Données du menu depuis l'API
      categories: [],
      menuItems: [],
      popularItems: [],
      itemsByCategory: {}
    }
  },
  async mounted() {
    // Charger les données du menu et des catégories
    await this.loadRestaurantData();
    this.initializeChat();
    
    // Montrer une notification après 3 secondes si le chat n'est pas ouvert
    setTimeout(() => {
      if (!this.isChatOpen && !this.hasShownWelcome) {
        this.hasNewMessage = true;
        this.hasShownWelcome = true;
      }
    }, 3000);
  },
  watch: {
    // Faire défiler vers le bas quand de nouveaux messages apparaissent
    messages: {
      deep: true,
      handler() {
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      }
    },
    // Réinitialiser la notification quand le chat s'ouvre
    isChatOpen(val) {
      if (val) {
        this.hasNewMessage = false;
      }
    }
  },
  methods: {
    // Charger les données du restaurant depuis l'API
    async loadRestaurantData() {
      try {
        // Récupérer les catégories
        const categoryResponse = await this.$axios.get('/categories');
        this.categories = categoryResponse.data;
        
        // Récupérer tous les articles du menu
        const menuResponse = await this.$axios.get('/menu');
        this.menuItems = menuResponse.data.map(item => {
          return {
            ...item[0],
            commentCount: item.commentCount
          };
        });
        
        // Organiser les plats par catégorie pour un accès rapide
        this.categories.forEach(category => {
          this.itemsByCategory[category.id] = this.menuItems.filter(
            item => item.category && item.category.id === category.id
          );
        });
        
        // Identifier les plats populaires (on prend les 3 premiers pour l'exemple)
        // Dans un cas réel, on pourrait les trier par nombre de commentaires ou une autre métrique
        this.popularItems = [...this.menuItems].sort((a, b) => b.commentCount - a.commentCount).slice(0, 3);
        
      } catch (error) {
        console.error('Erreur lors du chargement des données du restaurant:', error);
      }
    },
    
    // Obtenir l'URL complète de l'image
    getImageUrl(imagePath) {
      return `https://apinfeat.aa-world.store${imagePath}`;
    },
    
    initializeChat() {
      this.messages = [
        {
          type: 'bot',
          text: 'Bonjour ! Je suis l\'assistant NF-EAT. Comment puis-je vous aider aujourd\'hui ?',
          time: this.getTimeString()
        }
      ];
      
      // Suggestions initiales
      this.showMainSuggestions();
    },
    
    // Afficher les suggestions principales
    showMainSuggestions() {
      this.suggestions = [
        { text: '🍽️ Menu', action: 'menu' },
        { text: '🕒 Horaires', action: 'horaires' },
        { text: '📞 Contact', action: 'contact' }
      ];
    },
    
    // Sélectionner une suggestion
    selectSuggestion(suggestion) {
      // Ajouter la question sélectionnée aux messages
      this.messages.push({
        type: 'user',
        text: suggestion.text,
        time: this.getTimeString()
      });
      
      // Répondre en fonction de l'action
      this.respondToAction(suggestion.action);
    },
    
    // Répondre à une action spécifique
    respondToAction(action) {
      let response = '';
      let isHtml = false;
      let newSuggestions = [];
      
      switch(action) {
        case 'menu':
          isHtml = true;
          response = 'Voici notre <a href="/menus" class="chat-link">menu complet</a>. Que souhaitez-vous découvrir ?';
          
          // Suggestions basées sur les catégories réelles de la base de données
          newSuggestions = [
            { text: '🥘 Plats populaires', action: 'plats_populaires' },
            ...this.categories.map(cat => ({
              text: `${this.getCategoryEmoji(cat.title)} ${cat.title}`,
              action: `category_${cat.id}`
            }))
          ];
          break;
          
        case 'plats_populaires':
          isHtml = true;
          if (this.popularItems.length > 0) {
            response = 'Nos plats les plus populaires sont :\n' + 
              this.popularItems.map(item => 
                `• ${item.name} (${item.price} €)`
              ).join('\n') +
              '\n\nVous pouvez les retrouver sur <a href="/menus" class="chat-link">notre menu</a>.';
          } else {
            response = 'Nous n\'avons pas encore de plats populaires à vous recommander. Vous pouvez consulter <a href="/menus" class="chat-link">notre menu complet</a>.';
          }
          break;
        
        // Gérer les catégories dynamiques
        default:
          if (action.startsWith('category_')) {
            const categoryId = action.replace('category_', '');
            const category = this.categories.find(c => c.id.toString() === categoryId);
            
            if (category) {
              const items = this.itemsByCategory[categoryId] || [];
              if (items.length > 0) {
                response = `${this.getCategoryEmoji(category.title)} ${category.title}:\n` + 
                  items.map(item => `• ${item.name} (${item.price} €)`).join('\n');
                
                if (items.length > 5) { // Si plus de 5 items, ajouter un lien vers le menu
                  // Si beaucoup d'items, ajouter un lien vers la page complète
                  isHtml = true;
                  response += `\n\nVoir <a href="/menus" class="chat-link">tous nos ${category.title}</a>.`;
                }
              } else {
                response = `Désolé, nous n'avons pas d'articles dans la catégorie "${category.title}" actuellement.`;
              }
              break;
            }
          }
          
          // Si c'est une action non liée au menu, utiliser le comportement existant
          return this.respondToDefaultAction(action);
      }
      
      // Ajouter la réponse avec un délai pour simulation de frappe
      setTimeout(() => {
        this.messages.push({
          type: 'bot',
          text: response,
          isHtml: isHtml,
          time: this.getTimeString()
        });
        
        // CORRECTION: Ajouter le bouton de menu principal seulement s'il n'est pas déjà présent
        if (newSuggestions.length > 0) {
          // Toujours créer une nouvelle liste de suggestions avec un seul bouton "Menu principal"
          this.suggestions = [
            ...newSuggestions,
            { text: '🔙 Menu principal', action: 'retour_menu' }
          ];
        } else {
          this.suggestions = [{ text: '🔙 Menu principal', action: 'retour_menu' }];
        }
      }, 800);
    },
    
    // Fonction qui gère les actions par défaut (non liées au menu)
    respondToDefaultAction(action) {
      let response = '';
      let isHtml = false;
      let newSuggestions = [];
      
      switch(action) {
        case 'horaires':
          response = '🕒 Nos horaires d\'ouverture :\n• Mardi au Samedi : 11h30 - 14h30 et 18h30 - 22h30\n• Dimanche : 11h30 - 15h00\n• Lundi : Fermé';
          break;
          
        case 'reservation':
          isHtml = true;
          response = 'Vous pouvez réserver une table <a href="/contact" class="chat-link">ici</a> ou nous appeler au 07 XX XX XX XX.';
          newSuggestions = [
            { text: '📅 Pour aujourd\'hui', action: 'reservation_aujourdhui' },
            { text: '🗓️ Pour plus tard', action: 'reservation_plus_tard' }
          ];
          break;
          
        case 'livraison':
          response = '🚚 Nous proposons la livraison via plusieurs plateformes ou directement par notre service.';
          newSuggestions = [
            { text: '🏠 Zone de livraison', action: 'zone_livraison' },
            { text: '💰 Frais de livraison', action: 'frais_livraison' }
          ];
          break;
          
        case 'contact':
          isHtml = true;
          response = 'Vous pouvez nous contacter par :\n• Téléphone : 07 XX XX XX XX\n• Email : contact@nfeat.fr\n• <a href="/contact" class="chat-link">Formulaire de contact</a>';
          break;
          
        case 'reservation_aujourdhui':
          response = 'Pour une réservation aujourd\'hui, merci de nous appeler directement au 07 XX XX XX XX pour vérifier la disponibilité.';
          break;
          
        case 'reservation_plus_tard':
          isHtml = true;
          response = 'Pour réserver une table ultérieurement, vous pouvez utiliser <a href="/contact" class="chat-link">notre formulaire en ligne</a> en précisant la date, l\'heure et le nombre de personnes.';
          break;
          
        case 'zone_livraison':
          response = '🏡 Nous livrons dans un rayon de 10 km autour du restaurant:\n• Elbeuf\n• Saint-Aubin-lès-Elbeuf\n• Caudebec-lès-Elbeuf\n• Grand-Couronne\n• Saint-Pierre-lès-Elbeuf';
          break;
          
        case 'frais_livraison':
          response = '💰 Nos frais de livraison:\n• Moins de 3 km: Gratuit (commande min. 20€)\n• 3-5 km: 2,50€\n• 5-10 km: 4,50€';
          break;
          
        case 'retour_menu':
          this.showMainSuggestions();
          return;
          
        default:
          response = 'Je n\'ai pas compris votre demande. Comment puis-je vous aider ?';
          this.showMainSuggestions();
          return;
      }
      
      // Ajouter la réponse avec un délai pour simulation de frappe
      setTimeout(() => {
        this.messages.push({
          type: 'bot',
          text: response,
          isHtml: isHtml,
          time: this.getTimeString()
        });
        
        // CORRECTION: Même logique que dans respondToAction pour éviter la duplication
        if (newSuggestions.length > 0) {
          // Toujours créer une nouvelle liste de suggestions avec un seul bouton "Menu principal"
          this.suggestions = [
            ...newSuggestions,
            { text: '🔙 Menu principal', action: 'retour_menu' }
          ];
        } else {
          this.suggestions = [{ text: '🔙 Menu principal', action: 'retour_menu' }];
        }
      }, 800);
    },
    
    // Associer un emoji à chaque catégorie
    getCategoryEmoji(categoryTitle) {
      const title = categoryTitle.toLowerCase();
      if (title.includes('entrée')) return '🥗';
      if (title.includes('plat')) return '🍖';
      if (title.includes('dessert')) return '🍰';
      if (title.includes('boisson')) return '🥤';
      if (title.includes('sandwich')) return '🥪';
      if (title.includes('pizza')) return '🍕';
      if (title.includes('burger')) return '🍔';
      if (title.includes('salade')) return '🥗';
      if (title.includes('soupe')) return '🍲';
      // Emoji par défaut si aucune correspondance
      return '🍽️';
    },
    
    // Envoyer un message texte libre
    sendMessage() {
      if (!this.newMessage.trim()) return;
      
      const userMessage = this.newMessage;
      
      // Ajouter le message de l'utilisateur
      this.messages.push({
        type: 'user',
        text: userMessage,
        time: this.getTimeString()
      });
      
      this.newMessage = '';
      
      // Analyser le message et répondre
      setTimeout(() => {
        const response = this.analyzeMessage(userMessage);
        this.messages.push({
          type: 'bot',
          text: response.text,
          isHtml: response.isHtml,
          time: this.getTimeString()
        });
        
        // Mettre à jour les suggestions en fonction du message
        this.updateSuggestionsBasedOnMessage(userMessage);
      }, 1000);
    },
    
    // Analyser un message texte et générer une réponse
    analyzeMessage(message) {
      message = message.toLowerCase();
      
      if (message.includes('menu') || message.includes('carte') || message.includes('plat')) {
        return {
          text: 'Vous pouvez consulter <a href="/menus" class="chat-link">notre menu complet ici</a>. Nous proposons une variété de plats traditionnels syriens, libanais et méditerranéens.',
          isHtml: true
        };
      } else if (message.includes('horaire') || message.includes('ouvert') || message.includes('fermé')) {
        return {
          text: '🕒 Nos horaires d\'ouverture :\n• Mardi au Samedi : 11h30 - 14h30 et 18h30 - 22h30\n• Dimanche : 11h30 - 15h00\n• Lundi : Fermé',
          isHtml: false
        };
      } else if (message.includes('réserv') || message.includes('table')) {
        return {
          text: 'Pour réserver une table, vous pouvez <a href="/contact" class="chat-link">utiliser notre formulaire en ligne</a> ou nous appeler au 07 XX XX XX XX.',
          isHtml: true
        };
      } else if (message.includes('livr') || message.includes('commander') || message.includes('emporter')) {
        return {
          text: 'Nous proposons la livraison à domicile et la commande à emporter. Vous pouvez commander en ligne sur notre site ou nous appeler directement.',
          isHtml: false
        };
      } else if (message.includes('prix') || message.includes('tarif') || message.includes('coût')) {
        return {
          text: 'Nos prix varient entre 6€ et 20€ selon les plats. Vous pouvez consulter tous les détails sur <a href="/menus" class="chat-link">notre menu</a>.',
          isHtml: true
        };
      } else if (message.includes('adresse') || message.includes('où') || message.includes('itinéraire')) {
        return {
          text: 'Nous sommes situés au 123 Rue de la Gastronomie, 76500 Elbeuf. Vous pouvez trouver l\'itinéraire <a href="https://maps.google.com" target="_blank" class="chat-link">ici</a>.',
          isHtml: true
        };
      } else {
        return {
          text: 'Je ne suis pas sûr de comprendre votre question. N\'hésitez pas à choisir parmi les suggestions ci-dessous ou à reformuler votre demande.',
          isHtml: false
        };
      }
    },
    
    // Mettre à jour les suggestions en fonction du message
    updateSuggestionsBasedOnMessage(message) {
      message = message.toLowerCase();
      
      if (message.includes('menu') || message.includes('plat') || message.includes('carte')) {
        this.suggestions = [
          { text: '🥘 Plats populaires', action: 'plats_populaires' },
          { text: '🥗 Entrées', action: 'entrees' },
          { text: '🍖 Plats principaux', action: 'plats_principaux' },
          { text: '🍰 Desserts', action: 'desserts' },
          { text: '🔙 Menu principal', action: 'retour_menu' }
        ];
      } else if (message.includes('réserv') || message.includes('table')) {
        this.suggestions = [
          { text: '📅 Pour aujourd\'hui', action: 'reservation_aujourdhui' },
          { text: '🗓️ Pour plus tard', action: 'reservation_plus_tard' },
          { text: '🔙 Menu principal', action: 'retour_menu' }
        ];
      } else if (message.includes('livr') || message.includes('commander')) {
        this.suggestions = [
          { text: '🏠 Zone de livraison', action: 'zone_livraison' },
          { text: '💰 Frais de livraison', action: 'frais_livraison' },
          { text: '🔙 Menu principal', action: 'retour_menu' }
        ];
      } else if (message.includes('retour_menu') || message.includes('menu principal')) {
        this.showMainSuggestions();
      } else {
        this.showMainSuggestions();
      }
    },
    
    // Basculer l'état ouvert/fermé du chat
    toggleChat() {
      this.isChatOpen = !this.isChatOpen;
      
      if (this.isChatOpen) {
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      }
    },
    
    // Faire défiler jusqu'au dernier message
    scrollToBottom() {
      if (this.$refs.messagesContainer) {
        this.$refs.messagesContainer.scrollTop = this.$refs.messagesContainer.scrollHeight;
      }
    },
    
    // Obtenir l'heure actuelle formatée
    getTimeString() {
      const now = new Date();
      return now.getHours().toString().padStart(2, '0') + ':' + 
             now.getMinutes().toString().padStart(2, '0');
    }
  }
}
</script>

<style scoped>
.chatbot-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999; /* Valeur très élevée pour assurer visibilité */
}

/* Bouton du chatbot */
.chat-launcher {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #eab308;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  border: 2px solid white;
  position: relative;
  transition: transform 0.3s ease;
}

.chat-launcher:hover {
  transform: scale(1.05);
}

.chat-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.close-icon {
  font-size: 30px;
  color: white;
  font-weight: bold;
}

/* Badge de notification */
.notification-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: #ef4444;
  color: white;
  font-size: 12px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
  font-weight: bold;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

/* Fenêtre de chat */
.chat-window {
  position: absolute;
  bottom: 80px;
  right: 0;
  width: 320px;
  height: 450px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideIn 0.3s forwards;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* En-tête du chat */
.chat-header {
  background-color: #1f2937;
  color: white;
  padding: 15px;
  font-weight: bold;
  display: flex;
  align-items: center;
}

.header-title {
  flex: 1;
}

/* Conteneur des messages */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background-color: #f8f9fa;
}

/* Messages */
.message {
  padding: 12px;
  border-radius: 10px;
  max-width: 85%;
  word-break: break-word;
  position: relative;
  animation: fadeIn 0.3s forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.bot-message {
  background-color: #e2e8f0;
  align-self: flex-start;
  border-bottom-left-radius: 0;
}

.user-message {
  background-color: #eab308;
  color: white;
  align-self: flex-end;
  border-bottom-right-radius: 0;
}

.message-time {
  font-size: 10px;
  opacity: 0.7;
  margin-top: 5px;
  text-align: right;
}

/* Conteneur des suggestions */
.suggestion-container {
  padding: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  border-top: 1px solid #e2e8f0;
  background-color: #f8f9fa;
}

/* Puces de suggestions */
.suggestion-chip {
  background-color: #e2e8f0;
  color: #1f2937;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.suggestion-chip:hover {
  background-color: #d1d5db;
  transform: translateY(-2px);
}

/* Zone de saisie */
.chat-input {
  padding: 10px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  background-color: white;
}

.chat-input input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 20px;
  outline: none;
  margin-right: 10px;
}

.chat-input button {
  background-color: #eab308;
  color: white;
  border: none;
  width: 40px; /* Taille fixe pour le bouton rond */
  height: 40px; /* Taille fixe pour le bouton rond */
  border-radius: 50%; /* Rend le bouton rond */
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-input button:hover {
  background-color: #d97706;
  transform: scale(1.05);
}

.send-icon {
  font-style: normal;
  font-size: 20px;
}

/* Liens dans les messages */
:deep(.chat-link) {
  color: #2563eb;
  text-decoration: underline;
}

:deep(.chat-link):hover {
  text-decoration: none;
}

/* Mise en forme texte dans les messages */
.bot-message, .user-message {
  white-space: pre-line;
}
</style>
