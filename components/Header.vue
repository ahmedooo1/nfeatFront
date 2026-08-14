<template>
  <header class="bg-gray-800 p-4 text-white flex justify-between items-center">
    <router-link to="/" @click.native="closeMenu" >
      <img src="../assets/images/NF-EAT-transparent.png" alt="NF-EAT Logo" class="w-20 logo">
    </router-link>
    <button @click="toggleMenu" class="md:hidden">
      <img width="30" height="30" src="https://img.icons8.com/ios-filled/50/FFFFFF/menu--v1.png" alt="menu" />
    </button>
    <nav :class="{'block p-3 rounded-b-3xl': isMenuOpen , 'hidden': !isMenuOpen}" class="w-full md:flex md:items-center md:w-auto md:static absolute top-24 right-0 bg-gray-800 md:bg-transparent z-10 ">
      <ul class="flex flex-col md:flex-row md:space-x-4">
        <li>
          <router-link to="/" class="flex items-center" title="Accueil" @click.native="closeMenu">
            <img width="30" height="30" src="https://img.icons8.com/ios/50/FFFFFF/home--v1.png" alt="home--v1" class="mr-2" />Accueil
          </router-link>
        </li>
        <li v-if="$auth.loggedIn && $auth.user.roles.includes('ROLE_ADMIN')">
          <router-link to="/admin/dashboard" class="flex items-center" title="Dashboard" @click.native="closeMenu">
            <img width="30" height="30" src="https://img.icons8.com/ios/50/FFFFFF/control-panel--v2.png" alt="control-panel--v2" class="mr-2"/>Dashboard
          </router-link>
        </li>
        <li v-if="$auth.loggedIn && $auth.user.roles.includes('ROLE_ADMIN')">
          <router-link to="/admin/menu" class="flex items-center" title="Menu Admin" @click.native="closeMenu">
            <img width="30" height="30" src="https://img.icons8.com/windows/32/FFFFFF/circled-menu.png" alt="circled-menu" class="mr-2"/>Menu Admin
          </router-link>
        </li>
        <li v-if="$auth.loggedIn">
          <router-link to="/menus" class="flex items-center" title="Menu Admin" @click.native="closeMenu">
            <img width="30" height="30" src="https://img.icons8.com/wired/64/FFFFFF/list--v1.png" alt="list--v1" class="mr-2"/>Menu
          </router-link>
        </li>
        <li v-if="$auth.loggedIn">
          <router-link to="/profile" class="flex items-center" title="Profil" @click.native="closeMenu">
            <img width="30" height="30" src="https://img.icons8.com/glyph-neue/64/FFFFFF/test-account.png" alt="test-account" class="mr-2"/>Profil
          </router-link>
        </li>
        <li v-if="$auth.loggedIn">
          <router-link to="/cart" class="flex items-center" title="Panier" @click.native="closeMenu">
            <img width="30" height="30" src="https://img.icons8.com/pastel-glyph/64/FFFFFF/shopping-cart--v2.png" alt="shopping-cart--v2" class="mr-2"/>Panier
          </router-link>
        </li>
        <li v-if="$auth.loggedIn && $auth.user.roles.includes('ROLE_ADMIN')">
          <router-link to="/admin/notifications" class="relative flex items-center" title="Notifications" @click.native="closeMenu">
            <img width="30" height="30" src="https://img.icons8.com/external-creatype-outline-colourcreatype/64/FFFFFF/external-alarm-essential-ui-v2-creatype-outline-colourcreatype-2.png" alt="external-alarm-essential-ui-v2-creatype-outline-colourcreatype-2" class="mr-2"/>Notifications
            <span
              v-if="unreadCount > 0"
              class="absolute -top-1 left-3 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[11px] leading-[18px] text-center font-bold"
            >{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
          </router-link>
        </li>
        <li v-if="!$auth.loggedIn">
          <button @click="openModal" class="flex items-center" title="Ouvrir Modal">
            <img width="30" height="30" src="https://img.icons8.com/glyph-neue/64/FFFFFF/test-account.png" alt="test-account" class="mr-2"/>Espace Personnel
          </button>
        </li>
        <li v-if="$auth.loggedIn">
          <button @click="logout" class="bg-red-500 px-2 py-1 rounded-full flex items-center" title="Déconnexion">
            <img width="30" height="30" src="https://img.icons8.com/pixels/32/FFFFFF/exit.png" alt="exit" class="mr-2"/>Déconnexion
          </button>
        </li>
      </ul>
    </nav>
    <AuthModal v-if="showModal" @close="closeModal" />
  </header>
</template>

<script>
import AuthModal from '~/components/Modal.vue'

export default {
  components: {
    AuthModal
  },
  data() {
    return {
      showModal: false,
      isMenuOpen: false
    }
  },
  computed: {
    unreadCount() {
      return this.$store.state.notifications.unreadCount
    }
  },
  methods: {
    openModal() {
      this.showModal = true
    },
    closeModal() {
      this.showModal = false
    },
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen
    },
    closeMenu() {
      this.isMenuOpen = false
    },
    async logout() {
      await this.$auth.logout()
      this.closeMenu()
      this.$router.push('/')
    }
  },
  watch: {
    '$auth.loggedIn'(newVal) {
      if (newVal) {
        this.closeMenu()
      }
    },
  },
  beforeRouteLeave(to, from, next) {
    this.closeMenu();
    next();
  }
}
</script>

<style scoped>
.logo{
  z-index: 10;
}
@media (min-width: 768px) {
  .md\\:flex {
    display: flex !important;
  }
  .md\\:hidden {
    display: none !important;
  }
}

nav li{
  padding: 10px;
}
nav li:hover{
background-color: grey;
border-radius: 40px;
}
</style>
