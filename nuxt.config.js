export default {
  target: 'static',
  // Disable server-side rendering
  ssr: false,

  // Global page headers
  head: {
    titleTemplate: '%s  NF-EAT',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'D�couvrez une exp�rience culinaire unique chez NF-EAT' },
      { name: 'format-detection', content: 'telephone=no' },
      { name: 'robots', content: 'index, follow' },
      { name: 'keywords', content: 'restaurant, NF-EAT, menu, food, culinary experience, Need For Eat, need for eat, elbeuf, rouen, 76, syrie, restau, syrien, libanais, kurde, oriental, français, eu, nf eat, nfeat, need 4 eat' },
      { name: 'author', content: 'NF-EAT' },
      { name: 'msvalidate.01', content: '9AA7D2F9F28B799F6AA4B8097E5FA043' },
      { name: 'yandex-verification', content: '7beaf73f0a895dda' },
      { name: 'google-site-verification', content: 'CaHBqVBh43sP97d6KLHp9S9loBe1uogXIhTB2qr7Uc0' } 
    ],
    link: [
      { rel: 'icon', type: 'image/png', href: '/assets/images/NF-EAT-transparent.png' },
      { rel: 'canonical', href: 'https://nfeat.aa-world.store' }
    ],
    script: [
      { src: 'https://www.googletagmanager.com/gtag/js?id=G-9EHF70HDB3', async: true }
    ]
  },

  // Global CSS
  css: [
    '~/assets/css/tailwind.css',
    'vue-toastification/dist/index.css'
  ],

  // Plugins to run before rendering page
  plugins: [
    '~/plugins/toastification.js',
    '~/plugins/socket.js',
    '~/plugins/chat.js'
  ],

  // Auto import components
  components: true,

  // Modules for dev and build
  buildModules: [
  ],

  // Modules
  modules: [
    '@nuxtjs/axios',
    '@nuxtjs/auth-next',
    '@nuxtjs/tailwindcss',
    //'@nuxtjs/sitemap'
  ],

  axios: {
    baseURL: 'https://apinfeat.aa-world.store/api',
  },

  auth: {
    strategies: {
      local: {
        token: {
          property: 'token',
          global: true,
          required: true,
          type: 'Bearer',
        },
        user: {
          property: false, // Set to false since you are handling user manually
          autoFetch: true,
        },
        endpoints: {
          login: { url: '/login_check', method: 'post' },
          logout: { url: '/logout', method: 'post' },
          user: { url: '/user/getcurrent', method: 'post' },
        },
      },
    },
    redirect: {
      login: '/',
      logout: '/',
      callback: '/',
      home: '/'
    }
  },

  // Build Configuration
  build: {
    transpile: ['vue-chartjs', 'chart.js'],
    babel: {
      presets({ isServer }) {
        return [
          [
            require.resolve('@babel/preset-env'),
            {
              targets: isServer
                ? { node: 'current' }
                : { browsers: ['last 2 versions'], ie: 11 },
              modules: false
            }
          ]
        ]
      },
      plugins: [
        '@babel/plugin-proposal-optional-chaining',
        '@babel/plugin-proposal-class-properties'
            ]
    },
    extend(config, { isDev, isClient }) {
      if (isDev && isClient) {
        config.module.rules.push({
          test: /\.js$/,
          loader: 'babel-loader',
          exclude: /(node_modules)/
        })
      }
    }
  },

  // Extend routes
  router: {
    extendRoutes(routes, resolve) {
      routes.push(
        {
          name: 'home',
          path: '/',
          component: resolve(__dirname, 'pages/index.vue')
        },
        {
          name: 'contact',
          path: '/contact',
          component: resolve(__dirname, 'pages/contact.vue')
        },
        {
          name: 'about',
          path: '/about',
          component: resolve(__dirname, 'pages/about.vue')
        },

        {
          name: 'cart',
          path: '/cart',
          component: resolve(__dirname, 'pages/Cart.vue'),
          meta: { requiresAuth: true }
        },
        {
          name: 'admin-menu',
          path: '/admin/menu',
          component: resolve(__dirname, 'pages/admin/Menu.vue'),
          meta: { requiresAuth: true }
        },
        {
          name: 'payment-amount',
          path: '/payment/:amount',
          component: resolve(__dirname, 'pages/payment/[amount].vue')
        },
        {
          name: 'menu-details',
          path: '/menu/:id',
          component: resolve(__dirname, 'pages/menu/_id.vue')
        },
        {
          name: 'mentions-legales',
          path: '/mentions-legales',
          component: resolve(__dirname, 'pages/MentionLegales.vue')
        },
        {
          name: 'politique-confidentialite',
          path: '/politique-confidentialite',
          component: resolve(__dirname, 'pages/politique-confidentialite.vue')
        },
        {
          name: 'reset-password',
          path: '/reset-password/:token',
          component: resolve(__dirname, 'pages/reset-password/_token.vue')
        },
        {
          name: 'contact',
          path: '/contact',
          component: resolve(__dirname, 'pages/contact.vue')
        },
        {
          name: 'profile',
          path: '/profile',
          component: resolve(__dirname, 'pages/profile.vue'),
          meta: { requiresAuth: true }
        },
        {
          name: 'custom-error',
          path: '*',
          component: resolve(__dirname, 'pages/error.vue')
        }
      );
    }
  },

  generate: {
    fallback: '404.html',
    routes: ['/404']
  },

  server: {
    port: 3000,     
  },
}
