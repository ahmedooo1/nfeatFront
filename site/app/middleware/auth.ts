export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return
  const { user, token, fetchUser, loginOpen } = useAuth()
  if (token.value && !user.value) await fetchUser()
  if (!user.value) {
    useState('auth:redirect').value = to.fullPath
    loginOpen.value = true
    return navigateTo('/')
  }
})
