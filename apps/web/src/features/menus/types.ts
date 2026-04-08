export interface Menu {
  id: number
  name: string
  is_active: boolean
  workspace_id: number
  created_at: string
  updated_at: string
}

export interface CreateMenuInput {
  name: string
}

export interface MenuProductPrice {
  id: number
  menu_id: number
  product_id: number
  price: number
}

export interface SetMenuProductPriceInput {
  price: number
}

export type MenuProductType = 'REGULAR' | 'COMPLEMENTED' | 'COMBO'

export interface MenuProduct {
  id: number
  name: string
  description: string
  price: number
  base_price: number
  type: MenuProductType
  is_available: boolean
  content: string | null
  image_url: string | null
}

export interface MenuCategoryEntry {
  id: number
  name: string
  order: number
  products: MenuProduct[]
}

export interface MenuWithContent extends Menu {
  categories: MenuCategoryEntry[]
}
