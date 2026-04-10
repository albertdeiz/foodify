import { publicClient } from './public-client'
import type {
  PublicWorkspace,
  PublicMenu,
  PublicMenuProduct,
  PublicMenuCategory,
  PublicComplementType,
  PublicComplement,
  PublicComboItem,
  PublicProductDetail,
} from '../types'

// ─── Raw API response types ────────────────────────────────────────────────────

interface ApiPublicComplement {
  id: number
  name: string
  price: number
  increment: boolean
}

interface ApiPublicComplementType {
  id: number
  name: string
  required: boolean
  min_selectable: number
  max_selectable: number
  product_complements: ApiPublicComplement[]
}

interface ApiPublicMenuProduct {
  id: number
  name: string
  description: string
  price: number
  base_price: number
  type: string
  content: string | null
  image_url: string | null
}

interface ApiPublicMenuCategory {
  id: number
  name: string
  order: number
  products: ApiPublicMenuProduct[]
}

interface ApiPublicMenu {
  id: number
  name: string
  categories: ApiPublicMenuCategory[]
}

interface ApiPublicWorkspace {
  id: number
  name: string
  slug: string
  address: string
  menus: Array<{ id: number; name: string }>
}

interface ApiPublicComboItemProduct {
  id: number
  name: string
  description: string
  price: number
  complement_types: ApiPublicComplementType[]
}

interface ApiPublicComboItem {
  id: number
  order: number
  product_id: number | null
  product: ApiPublicComboItemProduct | null
}

interface ApiPublicProductDetail extends ApiPublicMenuProduct {
  complement_types: ApiPublicComplementType[]
  combo_items: ApiPublicComboItem[]
}

// ─── Transforms ────────────────────────────────────────────────────────────────

function toComplement(r: ApiPublicComplement): PublicComplement {
  return { id: r.id, name: r.name, price: r.price, increment: r.increment }
}

function toComplementType(r: ApiPublicComplementType): PublicComplementType {
  return {
    id: r.id,
    name: r.name,
    required: r.required,
    minSelectable: r.min_selectable,
    maxSelectable: r.max_selectable,
    productComplements: r.product_complements.map(toComplement),
  }
}

function toMenuProduct(r: ApiPublicMenuProduct): PublicMenuProduct {
  return {
    id: r.id,
    name: r.name,
    description: r.description,
    price: r.price,
    basePrice: r.base_price,
    type: r.type as PublicMenuProduct['type'],
    content: r.content,
    imageUrl: r.image_url,
  }
}

function toMenuCategory(r: ApiPublicMenuCategory): PublicMenuCategory {
  return { id: r.id, name: r.name, order: r.order, products: r.products.map(toMenuProduct) }
}

function toMenu(r: ApiPublicMenu): PublicMenu {
  return { id: r.id, name: r.name, categories: r.categories.map(toMenuCategory) }
}

function toComboItem(r: ApiPublicComboItem): PublicComboItem {
  return {
    id: r.id,
    order: r.order,
    productId: r.product_id,
    product: r.product
      ? {
          id: r.product.id,
          name: r.product.name,
          description: r.product.description,
          price: r.product.price,
          complementTypes: r.product.complement_types.map(toComplementType),
        }
      : null,
  }
}

function toProductDetail(r: ApiPublicProductDetail): PublicProductDetail {
  return {
    ...toMenuProduct(r),
    complementTypes: r.complement_types.map(toComplementType),
    comboItems: r.combo_items.map(toComboItem),
  }
}

// ─── API ───────────────────────────────────────────────────────────────────────

export const publicApi = {
  getRestaurant: (slug: string) =>
    publicClient.get<ApiPublicWorkspace>(`/public/${slug}`).then((r) => r.data as PublicWorkspace),

  getMenu: (slug: string, menuId: number) =>
    publicClient
      .get<ApiPublicMenu>(`/public/${slug}/menus/${menuId}`)
      .then((r) => toMenu(r.data)),

  getProductDetail: (slug: string, productId: number) =>
    publicClient
      .get<ApiPublicProductDetail>(`/public/${slug}/products/${productId}`)
      .then((r) => toProductDetail(r.data)),
}
