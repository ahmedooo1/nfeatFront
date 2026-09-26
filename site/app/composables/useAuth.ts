import type { User } from '~/types'

export function useAuth() {
  const api = useApi()
  const token = useToken()
  const user = useState<User | null>('auth:user', () => null)
  const loginOpen = useState('auth:modal', () => false)

  const loggedIn = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => !!user.value?.roles?.includes('ROLE_ADMIN'))

  async function fetchUser() {
    if (!token.value) {
      user.value = null
      return null
    }
    try {
      user.value = await api<User>('/user/getcurrent', { method: 'POST' })
    } catch {
      user.value = null
      token.value = null
    }
    return user.value
  }

  async function login(email: string, password: string) {
    const res = await api<{ token: string }>('/login_check', { method: 'POST', body: { username: email, password } })
    token.value = res.token
    await fetchUser()
    await useCart().mergeGuestCart()
  }

  async function register(payload: { name: string; email: string; plainPassword: string; agreeTerms: boolean }) {
    await api('/user/register', { method: 'POST', body: payload })
    await login(payload.email, payload.plainPassword)
  }

  function logout() {
    token.value = null
    user.value = null
    useCart().reset()
    navigateTo('/')
  }

  return { user, token, loggedIn, isAdmin, loginOpen, fetchUser, login, register, logout }
}
