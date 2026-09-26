import type { FetchOptions } from 'ofetch'

/** Appels à l'API NF-EAT, avec le jeton de l'utilisateur connecté. */
export function useApi() {
  const { public: config } = useRuntimeConfig()
  const token = useToken()

  const api = $fetch.create({
    baseURL: `${config.apiBase}/api`,
    onRequest({ options }) {
      if (token.value) {
        const headers = new Headers(options.headers as HeadersInit)
        headers.set('Authorization', `Bearer ${token.value}`)
        options.headers = headers
      }
    },
    onResponseError({ response }) {
      // Jeton expiré ou révoqué : on se déconnecte proprement.
      if (response.status === 401 && token.value) {
        token.value = null
        useState<unknown>('auth:user').value = null
      }
    },
  })

  return <T = unknown>(url: string, opts?: FetchOptions<'json'>) => api<T>(url, opts as never)
}

/** Message d'erreur lisible à partir d'une erreur d'API. */
export function apiMessage(error: unknown, fallback = 'Une erreur est survenue. Réessayez.'): string {
  const data = (error as { data?: { message?: string; violations?: string[] } })?.data
  if (data?.violations?.length) return data.violations.join(' ')
  if (data?.message) return data.message
  return fallback
}

export const imageUrl = (path?: string | null) => {
  if (!path) return null
  if (/^https?:\/\//.test(path)) return path
  return `${useRuntimeConfig().public.apiBase}${path}`
}
