// v-reveal : apparition douce des blocs au défilement. L'élément porte aussi
// la classe « reveal » dans le gabarit (identique côté serveur et navigateur).
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('reveal', {
    mounted(el: HTMLElement, binding) {
      if (binding.value) el.style.transitionDelay = `${binding.value}ms`
      if (!('IntersectionObserver' in window)) return el.classList.add('is-visible')
      const io = new IntersectionObserver(
        (entries) => entries.forEach((e) => {
          if (e.isIntersecting) {
            el.classList.add('is-visible')
            io.disconnect()
          }
        }),
        { rootMargin: '0px 0px -8% 0px' },
      )
      io.observe(el)
    },
  })
})
