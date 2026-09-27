export interface Category {
  id: number
  title: string
  content?: string
}

export interface Dish {
  id: number
  name: string
  description: string
  price: string
  image_url: string | null
  category?: { id: number; title: string } | null
  commentCount: number
  /** Absent sur les anciennes données : disponible par défaut. */
  available?: boolean
}

export interface Review {
  id: number
  content: string
  createdAt: string
  menuItemId?: number
  user: { id: number; name: string | null } | null
}

export interface User {
  id: number
  email: string
  name: string | null
  roles: string[]
  picture?: string | null
  phone?: string | null
  emailVerified?: boolean
}

export interface CartLine {
  menuItemId: number
  name: string
  price: string
  image_url: string | null
  quantity: number
  description?: string
  available?: boolean
}

export type OrderStatus = 'received' | 'preparing' | 'ready' | 'collected' | 'cancelled'
export type PaymentMethod = 'card' | 'onsite'

export interface OrderSummary {
  id: number
  createdAt: string
  status: OrderStatus
  paymentMethod: PaymentMethod
  isPaid: boolean
  pickupAt: string | null
  note: string | null
  total: number
  items: { menuItemId: number; name: string; quantity: number; unitPrice: number }[]
  customer?: { id: number; name: string | null; email: string; phone: string | null }
}

export interface RestaurantStatus {
  openNow: boolean
  prepMinutes: number
  slots: string[]
  payment: { online: boolean; onsite: boolean }
  /** Adresse e-mail confirmée exigée pour commander. */
  emailVerification?: boolean
}
