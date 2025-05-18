<template>
  <div  class="bg-gray-800 ">
    <Header />

          <Nuxt  class=" min-h-screen"/>
          <CookieConsent />
          <Chatbot/>

    <Footer/>
  </div>
</template>

<script>
import Header from '~/components/Header.vue'
import Footer from '~/components/Footer.vue'
import CookieConsent from '~/components/CookieConsent.vue';
import Chatbot from '~/components/Chatbot.vue';


export default {
  components: {
    Header,
    Footer,
    CookieConsent,
    Chatbot
  }
}
</script>

<style>
/* Add any global styles here */
</style>
