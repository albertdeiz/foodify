export interface Menu {
  id: number
  name: string
  isActive: boolean
  workspaceId: number
  createdAt: string
  updatedAt: string
}

export interface CreateMenuInput {
  name: string
}

export interface MenuProductPrice {
  menuId: number
  productId: number
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
  basePrice: number
  type: MenuProductType
  isAvailable: boolean
  content: string | null
  imageUrl: string | null
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
