/**
 * Toutes les informations propres au restaurant, au même endroit. Pour livrer
 * le site à un nouveau client : modifier ce fichier, les couleurs dans
 * assets/css/main.css (@theme) et les images de public/images.
 */
export const restaurant = {
  name: 'NF-EAT',
  fullName: 'Need For Eat',
  siteUrl: 'https://nfeat.aaweb.fr',
  tagline: 'Saveurs d’Orient, faites maison.',
  description:
    'Cuisine syrienne, libanaise et kurde préparée chaque jour avec des produits frais. Commandez en ligne, récupérez sur place ou régalez-vous en salle.',
  cuisine: ['Syrienne', 'Libanaise', 'Kurde', 'Orientale'],
  priceRange: '€€',
  // Coordonnées de démonstration : laisser vide ce qui n'est pas encore connu,
  // les composants masquent automatiquement les champs vides.
  phone: '' as string,
  email: '' as string,
  address: {
    street: '' as string,
    postalCode: '76500',
    city: 'Elbeuf',
    country: 'FR',
  },
  // 0 = dimanche … 6 = samedi ; heures au format 24 h.
  hours: [
    { days: [1, 2, 3, 4, 5], label: 'Lundi – vendredi', open: '11:30', close: '22:00' },
    { days: [6, 0], label: 'Samedi – dimanche', open: '11:00', close: '23:00' },
  ],
  pickupMinutes: 20,
  socials: {
    instagram: 'https://instagram.com/',
    facebook: 'https://facebook.com/',
    tiktok: 'https://tiktok.com/',
  },
  // Mention « site à vendre » : à retirer une fois le site livré à un client.
  forSale: {
    enabled: true,
    contact: 'ahmad.ahmad.professionnel@gmail.com',
  },
} as const

export type RestaurantConfig = typeof restaurant
