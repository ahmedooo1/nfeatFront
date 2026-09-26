// Une seule référence partagée vers le cookie du jeton : useCookie crée une
// copie indépendante à chaque appel, qui se désynchroniserait des autres.
export default defineNuxtPlugin(() => {
  const token = useCookie<string | null>('nfeat_token', { sameSite: 'lax', secure: !import.meta.dev, maxAge: 60 * 60 })
  return { provide: { token } }
})
