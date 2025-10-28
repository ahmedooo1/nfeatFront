<template>
  <div>
    <!-- Hero Section with Custom Slider -->
    <div class="sale-badge text-white text-xl font-bold">Site à Vendre ! <br>
      <a href="/contact" class="text-white text-xl font-bold text-yellow-300 sale-link">Contacte nous !</a>
    </div>
    <section class="relative bg-center bg-cover h-screen bg-gray-800 text-white">
      <div class="relative inset-0 bg-black opacity-50"></div>
      <div class="absolute inset-0">
        <div v-for="(image, index) in images" :key="index" class="bg-image" :style="{ backgroundImage: `url(${image})` }" :class="{ 'active': index === currentIndex }"></div>
      </div>
      <div class="relative flex items-center justify-center h-full">
        <div class="text-center text-white animate-slide-up">
          <img src="../assets/images/NF-EAT-transparent.png" alt="NF-EAT Logo" class="w-56 mx-auto">
          <h1 class="text-5xl font-bold mb-4">Bienvenue chez NF-EAT</h1>
          <p class="text-lg mb-6">Découvrez une expérience culinaire unique</p>
          <button @click="scrollToMenu" class="bg-yellow-500 hover:bg-yellow-700 text-white font-semibold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105 flex m-auto">Voir le Menu<img width="30" height="30" src="https://img.icons8.com/wired/64/FFFFFF/list--v1.png" alt="list--v1" class="mx-2"/></button>
        </div>
      </div>
    </section>

    <!-- Menu Section -->
    <section ref="menuSection" class="py-16 text-white">
      <div class="container mx-auto px-6 text-center">
        <div class="relative">
          <img src="../assets/images/Paint_Brush.png" alt="NF-EAT Menu title bg" class="w-64 mx-auto opacity-0">
          <h2 class="text-4xl font-bold text-center mb-12 bg-title">Nos Menus</h2>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 text-left">
          <div v-for="(menu, index) in limitedMenus" :key="index" class="bg-gray-600 rounded-lg shadow-lg overflow-hidden animate-slide-in transition duration-300 ease-in-out transform hover:scale-105">
            <img :src="getImageUrl(menu.image_url)" alt="Menu Image" class="w-full h-48 object-cover">
            <div class="p-4">
              <h3 class="text-xl font-semibold mb-2">{{ menu.name }}</h3>
              <p v-if="menu.description">{{ truncateDescription(menu.description) }} <span class="underline text-yellow-500 cursor-pointer" @click.stop="goToDetails(menu.id)">Voir plus</span></p>
              <p class="text-lg font-bold mt-2">{{ menu.price }} €</p>
              <button v-if="$auth.loggedIn" @click.stop="addToCart(menu)" class="bg-green-500 text-white px-4 py-2 rounded mt-2 transition duration-300 ease-in-out transform hover:scale-105">
                <img width="25" height="25" src="https://img.icons8.com/windows/32/FFFFFF/add-to-shopping-basket.png" alt="add-to-shopping-basket"/>
              </button>
              <button v-if="!$auth.loggedIn" @click.stop="openModal" class="bg-green-500 text-white px-4 py-2 rounded mt-2 transition duration-300 ease-in-out transform hover:scale-105">
                <img width="25" height="25" src="https://img.icons8.com/windows/32/FFFFFF/add-to-shopping-basket.png" alt="add-to-shopping-basket"/>
              </button>
            </div>
          </div>
        </div>
        <button class="bg-yellow-500 hover:bg-yellow-700 text-white font-semibold py-2 px-4 rounded-full mt-4 transition duration-300 ease-in-out transform hover:scale-105" @click="$router.push('/menus')">Voir plus</button>
      </div>
    </section>

    <!-- Presentation Section -->
    <section class="py-16 text-white">
      <div class="container mx-auto px-6">
        <div class="relative text-center">
        <h2 class="text-4xl font-bold text-center mb-12 bg-title">À propos de NF-EAT</h2>
        </div>
        <div class="flex flex-col md:flex-row items-center">
          <div class="md:w-1/2 md:pr-8">
            <img src="../assets/images/restauNFE.jpg" alt="About Image" class="rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105 w-full">
          </div>
          <div class="md:w-1/2 md:pl-8 mt-8 md:mt-0">
            <p class="text-lg mb-4">
              NF-EAT est un restaurant de renommée offrant une expérience culinaire exceptionnelle. Notre équipe de chefs talentueux utilise les meilleurs ingrédients pour créer des plats délicieux et innovants. Venez découvrir notre menu varié et savourez chaque bouchée.
            </p>
            <button class="bg-yellow-500 hover:bg-yellow-700 text-white font-semibold py-2 px-4 rounded-full mt-4 transition duration-300 ease-in-out transform hover:scale-105" @click="$router.push('/about')">En savoir plus</button>
          </div>
        </div>
      </div>
    </section>

    <!-- Services Section -->
    <section class="py-16 text-white">
      <div class="container mx-auto px-6">
        <div class="relative text-center">
        <h2 class="text-4xl font-bold text-center mb-12 bg-title">Nos Services</h2>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          <div class="text-center p-8 bg-gray-600 rounded-lg shadow-lg animate-fade-in transition duration-300 ease-in-out transform hover:scale-105">
            <i class="fas fa-utensils w-16 h-16 mx-auto mb-4 text-yellow-500"></i>
            <h3 class="text-xl font-semibold mb-2">Service de Traiteur</h3>
            <p>Nous offrons un service de traiteur pour vos événements spéciaux avec des plats délicieux et un service professionnel.</p>
          </div>
          <div class="text-center p-8 bg-gray-600 rounded-lg shadow-lg animate-fade-in transition duration-300 ease-in-out transform hover:scale-105">
            <i class="fas fa-truck w-16 h-16 mx-auto mb-4 text-yellow-500"></i>
            <h3 class="text-xl font-semibold mb-2">Horaires d'Ouverture</h3>
            <p>Nous sommes ouverts du lundi au vendredi de 9h à 22h, et le week-end de 10h à 23h.</p>
          </div>
          <div class="text-center p-8 bg-gray-600 rounded-lg shadow-lg animate-fade-in transition duration-300 ease-in-out transform hover:scale-105">
            <i class="fas fa-concierge-bell w-16 h-16 mx-auto mb-4 text-yellow-500"></i>
            <h3 class="text-xl font-semibold mb-2">Réservations</h3>
            <p>Réservez votre commande chez votre restaurant NF-EAT pour une expérience culinaire inoubliable dans un cadre élégant et confortable.</p>
          </div>
        </div>
      </div>
    </section>
    <AuthModal v-if="showModal" @close="showModal = false" />
  </div>
</template>

<script>
import AuthModal from '~/components/Modal.vue'

export default {
  components: {
    AuthModal
  },
  data() {
    return {
      menus: [],
      images: [],
      currentIndex: 0,
      expandedDescriptions: [],
      showModal: false

    };
  },
  async mounted() {
    await this.fetchMenus();
    this.startSlider();
  },
  methods: {
    async fetchMenus() {
      try {
        const response = await this.$axios.get('/menu');
        this.menus = response.data.map(item => {
          // Flatten the response to remove the extra layer
          return {
            ...item[0],
            commentCount: item.commentCount
          };
        });
        this.images = this.menus.map(menu => this.getImageUrl(menu.image_url));
      } catch (error) {
        console.error('Failed to load menus', error);
      }
    },
    getImageUrl(imagePath) {
  return `https://apinfeat.aaweb.fr${imagePath}`;
    },
    startSlider() {
      setInterval(() => {
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
      }, 5000);
    },
    scrollToMenu() {
      const menuSection = this.$refs.menuSection;
      window.scrollTo({
        top: menuSection.offsetTop,
        behavior: 'smooth'
      });
    },
    async addToCart(menu) {
      if (!this.$auth.loggedIn) {
        this.showModal = true;
        return;
      }
      try {
        const payload = {
          userId: this.$auth.user.id,
          menuItemId: menu.id,
          quantity: 1
        };
        await this.$axios.post('/carts', payload);
        this.$toast.success('Article ajouté au panier');
      } catch (error) {
        console.error('Failed to add item to cart', error);
      }
    },
    openModal() {
      this.showModal = true;
    },
    truncateDescription(description) {
      if (description.length > 100) {
        return description.slice(0, 100) + '...';
      }
      return description;
    },
    showFullDescription(index) {
      this.$set(this.expandedDescriptions, index, true);
    },
    goToDetails(id) {
      this.$router.push({ path: `/menu/${id}` });
    }
  },
  computed: {
    limitedMenus() {
      return this.menus.slice(0, 4);
    }
  }
};
</script>

<style scoped>
/* Animations */
@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slide-horizontal {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-slide-up {
  animation: slide-up 1s ease-out;
}

.animate-slide-in {
  animation: slide-in 1s ease-out;
}

.animate-fade-in {
  animation: fade-in 1s ease-out;
}

.bg-image {
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
  transition: opacity 1s ease-in-out, transform 1s ease-in-out;
  overflow: hidden; /* Prevent overflow */
}

.bg-image.active {
  opacity: 1;
  transform: translateX(0);
  animation: slide-horizontal 1s ease-in-out;
}

section.relative {
  overflow: hidden; /* Prevent overflow */
}

.bg-title {
  position: relative;
  display: inline-block;
  padding: 0 1rem;
  background: url('../assets/images/Paint_Brush.png') no-repeat center;
  background-size: cover;
  padding: 1rem 3rem;
}

.sale-badge {
  position: fixed;
  top: 120px;
  right: 20px;
  background-color: #ff0000; /* Bright red color */
  padding: 10px 20px;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  z-index: 1000;
  animation: pulse 2s infinite;
}

.sale-link {
  /*color: #ffffff;*/ /* White text */
  font-size: 1.2rem;
  font-weight: bold;
  text-decoration: underline;
  cursor: pointer;
}

.sale-link:hover {
  color: #ffcc00; /* Change color on hover for effect */
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
</style>
