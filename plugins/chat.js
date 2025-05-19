import Vue from 'vue'
import { Chat } from 'vue-beautiful-chat'

// Utilisation de notre CSS personnalisé au lieu de celui du package
import '~/assets/css/chat.css'

// Enregistrement du composant globalement
Vue.component('beautiful-chat', Chat)

export default () => {
  // Plugin vide car l'import et l'enregistrement du composant sont faits ci-dessus
}