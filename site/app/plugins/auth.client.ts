// Au chargement : on retrouve l'utilisateur connecté et son panier.
export default defineNuxtPlugin(async () => {
  const { fetchUser } = useAuth()
  await fetchUser()
  useCart().refresh().catch(() => {})
})
