export interface Menu {
  id: number
  name: string
  is_active: boolean
  workspace_id: number
  created_at: Date
  updated_at: Date
}

export type CreateMenuInput = Pick<Menu, 'name' | 'workspace_id'>
export type UpdateMenuInput = Partial<Pick<Menu, 'name' | 'is_active'>>

export interface MenuProduct {
  id: number
  name: string
  description: string
  price: number       // precio efectivo (especial si existe, si no, base)
  base_price: number  // precio base del catálogo
  type: string
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
