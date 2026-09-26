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
}

export interface CartLine {
  menuItemId: number
  name: string
  price: string
  image_url: string | null
  quantity: number
  description?: string
}

export interface OrderSummary {
  id: number
  createdAt: string
  isPaid: boolean
  total: number
  items: { menuItemId: number; name: string; quantity: number; unitPrice: number }[]
  customer?: { id: number; name: string | null; email: string }
}
