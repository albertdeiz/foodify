import type { ComplementType } from '@/features/complement-types/types'

export type ProductType = 'REGULAR' | 'COMPLEMENTED' | 'COMBO'

export interface Product {
  id: number
  name: string
  description: string
  price: number
  imageUrl: string | null
  type: ProductType
  isAvailable: boolean
  content: string | null
  workspaceId: number
  createdAt: string
  updatedAt: string
}

export interface ComboItem {
  id: number
  order: number
  productId: number | null
  product: Product | null
}

export interface ProductWithDetails extends Product {
  complementTypes: ComplementType[]
  comboItems: ComboItem[]
}

export interface CreateProductInput {
  name: string
  description: string
  price: number
  imageUrl?: string
  type?: ProductType
  content?: string
  isAvailable?: boolean
}

export interface CreateComboItemInput {
  order: number
  productId?: number
}

export interface UpdateComboItemInput {
  order?: number
}
