import tailwindcss from '@tailwindcss/vite'
import { restaurant } from './app/restaurant.config'

const apiBase = process.env.NUXT_PUBLIC_API_BASE || 'https://apinfeat.aaweb.fr'

export default defineNuxtConfig({
  compatibilityDate: '2026-09-01',
  devtools: { enabled: false },

  // Site statique : les pages publiques sont pré-rendues (contenu lisible par
  // Google), les pages de compte et d'administration sont rendues côté
  // navigateur.
  ssr: true,
  nitro: {
    preset: 'static',
    prerender: {
      crawlLinks: true,
      routes: ['/', '/carte', '/a-propos', '/contact', '/mentions-legales', '/confidentialite', '/sitemap.xml', '/panier', '/commande', '/commande/suivi', '/commande/confirmation', '/compte', '/compte/commandes', '/verifier-email'],
      failOnError: false,
    },
  },
  routeRules: {
    '/compte/**': { ssr: false },
    '/admin/**': { ssr: false },
    '/panier': { ssr: false },
    '/commande/**': { ssr: false },
    '/reset-password/**': { ssr: false },
    '/verifier-email': { ssr: false },
    // Ancienne adresse de paiement (le montant n'est plus dans l'URL).
    '/payment/**': { redirect: '/commande' },
  },

  css: ['~/assets/css/main.css'],
  vite: { plugins: [tailwindcss()] },

  runtimeConfig: {
    public: {
      apiBase,
      stripeKey: process.env.NUXT_PUBLIC_STRIPE_KEY || 'pk_test_51NAd2mCCNM9KNgubo0Z8AcnFjXA55XhZdi7MTdXRNjuCWDPchNKBd6mTy7mCRXaT6bHSRT6xcTSEfnlMzE5J68m400ScKGFHko',
      mercureUrl: process.env.NUXT_PUBLIC_MERCURE_URL || `${apiBase}/.well-known/mercure`,
      mercureTopic: process.env.NUXT_PUBLIC_MERCURE_TOPIC || 'https://apinfeat.aaweb.fr/orders/notifications',
      gaId: process.env.NUXT_PUBLIC_GA_ID || 'G-9EHF70HDB3',
      siteUrl: restaurant.siteUrl,
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'fr' },
      titleTemplate: `%s · ${restaurant.name}`,
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#1f2937' },
        { name: 'format-detection', content: 'telephone=no' },
        { property: 'og:site_name', content: restaurant.name },
        { property: 'og:type', content: 'restaurant.restaurant' },
        { property: 'og:image', content: `${restaurant.siteUrl}/images/restaurant.jpg` },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'msvalidate.01', content: '9AA7D2F9F28B799F6AA4B8097E5FA043' },
        { name: 'yandex-verification', content: '7beaf73f0a895dda' },
        { name: 'google-site-verification', content: 'CaHBqVBh43sP97d6KLHp9S9loBe1uogXIhTB2qr7Uc0' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/images/logo.png' },
        { rel: 'apple-touch-icon', href: '/images/logo.png' },
        { rel: 'preconnect', href: apiBase },
      ],
    },
  },
})
