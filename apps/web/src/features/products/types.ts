import type { ComplementType } from '@/features/complement-types/types'

export type ProductType = 'REGULAR' | 'COMPLEMENTED' | 'COMBO'

export interface Product {
  id: number
  name: string
  description: string
  price: number
  image_url: string | null
  type: ProductType
  is_available: boolean
  content: string | null
  workspace_id: number
  created_at: string
  updated_at: string
}

export interface ComboItem {
  id: number
  order: number
  product_id: number | null
  complement_type_id: number | null
  product: Product | null
  complement_type: ComplementType | null
}

export interface ProductWithDetails extends Product {
  complement_types: ComplementType[]
  combo_items: ComboItem[]
}

export interface CreateProductInput {
  name: string
  description: string
  price: number
  image_url?: string
  type?: ProductType
  content?: string
}

export interface CreateComboItemInput {
  order: number
  product_id?: number
  complement_type_id?: number
}

export interface UpdateComboItemInput {
  order?: number
}
