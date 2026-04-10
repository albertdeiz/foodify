export type PublicProductType = 'REGULAR' | 'COMPLEMENTED' | 'COMBO'

export interface PublicWorkspace {
  id: number
  name: string
  slug: string
  address: string
  menus: Array<{ id: number; name: string }>
}

export interface PublicMenuProduct {
  id: number
  name: string
  description: string
  price: number
  base_price: number
  type: PublicProductType
  content: string | null
  image_url: string | null
}

export interface PublicMenuCategory {
  id: number
  name: string
  order: number
  products: PublicMenuProduct[]
}

export interface PublicMenu {
  id: number
  name: string
  categories: PublicMenuCategory[]
}

export interface PublicComplement {
  id: number
  name: string
  price: number
  increment: boolean
}

export interface PublicComplementType {
  id: number
  name: string
  required: boolean
  min_selectable: number
  max_selectable: number
  product_complements: PublicComplement[]
}

export interface PublicComboItem {
  id: number
  order: number
  product_id: number | null
  product: { id: number; name: string; description: string; price: number } | null
}

export interface PublicProductDetail extends PublicMenuProduct {
  complement_types: PublicComplementType[]
  combo_items: PublicComboItem[]
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export interface CartSelectedOption {
  id: number
  name: string
  price: number
  increment: boolean
}

export interface CartComplement {
  typeId: number
  typeName: string
  required: boolean
  min_selectable: number
  max_selectable: number
  selectedOptions: CartSelectedOption[]
}

export interface CartComboSlot {
  slotId: number
  order: number
  fixedProduct?: { id: number; name: string }
}

export interface CartItem {
  uid: string
  productId: number
  productName: string
  productImage: string | null
  productType: PublicProductType
  menuPrice: number
  complements: CartComplement[]
  comboSlots: CartComboSlot[]
  quantity: number
}
