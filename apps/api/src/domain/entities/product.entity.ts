import type { ComplementType } from './complement-type.entity'

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
  created_at: Date
  updated_at: Date
}

export interface ComboItem {
  id: number
  order: number
  combo_product_id: number
  product_id: number | null
  product: Product | null
}

export interface ProductWithDetails extends Product {
  complement_types: ComplementType[]
  combo_items: ComboItem[]
}

// Public-facing product detail: combo item products include their complement types
export interface PublicComboItemProduct {
  id: number
  name: string
  description: string
  price: number
  complement_types: ComplementType[]
}

export interface PublicComboItem {
  id: number
  order: number
  product_id: number | null
  product: PublicComboItemProduct | null
}

export interface PublicProductDetail extends Product {
  complement_types: ComplementType[]
  combo_items: PublicComboItem[]
}

export type CreateProductInput = Pick<Product, 'name' | 'description' | 'price' | 'workspace_id'> & {
  image_url?: string
  type?: ProductType
  content?: string
}

export type UpdateProductInput = Partial<
  Pick<Product, 'name' | 'description' | 'price' | 'image_url' | 'type' | 'is_available' | 'content'>
>

export type CreateComboItemInput = {
  product_id?: number | null
  order?: number
}

export type UpdateComboItemInput = Partial<CreateComboItemInput>
