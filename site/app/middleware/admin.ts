export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) return
  const { user, token, fetchUser, isAdmin } = useAuth()
  if (token.value && !user.value) await fetchUser()
  if (!isAdmin.value) return navigateTo('/')
})
