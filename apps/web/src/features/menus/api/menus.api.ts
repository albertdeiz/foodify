import { apiClient } from '@/shared/lib/api-client'
import type { Menu, MenuWithContent, MenuCategoryEntry, MenuProduct, CreateMenuInput, MenuProductPrice, SetMenuProductPriceInput } from '../types'

// ─── Raw API response types ────────────────────────────────────────────────────

interface ApiMenu {
  id: number
  name: string
  is_active: boolean
  workspace_id: number
  created_at: string
  updated_at: string
}

interface ApiMenuProduct {
  id: number
  name: string
  description: string
  price: number
  base_price: number
  type: string
  is_available: boolean
  content: string | null
  image_url: string | null
}

interface ApiMenuCategory {
  id: number
  name: string
  order: number
  products: ApiMenuProduct[]
}

interface ApiMenuWithContent extends ApiMenu {
  categories: ApiMenuCategory[]
}

interface ApiMenuProductPrice {
  menu_id: number
  product_id: number
  price: number
}

// ─── Transforms ────────────────────────────────────────────────────────────────

function toMenu(r: ApiMenu): Menu {
  return {
    id: r.id,
    name: r.name,
    isActive: r.is_active,
    workspaceId: r.workspace_id,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}

function toMenuProduct(r: ApiMenuProduct): MenuProduct {
  return {
    id: r.id,
    name: r.name,
    description: r.description,
    price: r.price,
    basePrice: r.base_price,
    type: r.type as MenuProduct['type'],
    isAvailable: r.is_available,
    content: r.content,
    imageUrl: r.image_url,
  }
}

function toMenuCategory(r: ApiMenuCategory): MenuCategoryEntry {
  return {
    id: r.id,
    name: r.name,
    order: r.order,
    products: r.products.map(toMenuProduct),
  }
}

function toMenuWithContent(r: ApiMenuWithContent): MenuWithContent {
  return { ...toMenu(r), categories: r.categories.map(toMenuCategory) }
}

function toMenuProductPrice(r: ApiMenuProductPrice): MenuProductPrice {
  return { menuId: r.menu_id, productId: r.product_id, price: r.price }
}

// ─── API ───────────────────────────────────────────────────────────────────────

export const menusApi = {
  getAll: (workspaceId: number) =>
    apiClient
      .get<ApiMenu[]>(`/workspaces/${workspaceId}/menus`)
      .then((r) => r.data.map(toMenu)),

  getById: (workspaceId: number, menuId: number) =>
    apiClient
      .get<ApiMenuWithContent>(`/workspaces/${workspaceId}/menus/${menuId}`)
      .then((r) => toMenuWithContent(r.data)),

  create: (workspaceId: number, input: CreateMenuInput) =>
    apiClient
      .post<ApiMenu>(`/workspaces/${workspaceId}/menus`, input)
      .then((r) => toMenu(r.data)),

  update: (workspaceId: number, id: number, input: Partial<Pick<Menu, 'name' | 'isActive'>>) =>
    apiClient
      .patch<ApiMenu>(`/workspaces/${workspaceId}/menus/${id}`, {
        name: input.name,
        is_active: input.isActive,
      })
      .then((r) => toMenu(r.data)),

  delete: (workspaceId: number, id: number) =>
    apiClient.delete(`/workspaces/${workspaceId}/menus/${id}`),

  assignCategory: (workspaceId: number, menuId: number, categoryId: number) =>
    apiClient.post(`/workspaces/${workspaceId}/menus/${menuId}/categories/${categoryId}`),

  removeCategory: (workspaceId: number, menuId: number, categoryId: number) =>
    apiClient.delete(`/workspaces/${workspaceId}/menus/${menuId}/categories/${categoryId}`),

  setProductPrice: (workspaceId: number, menuId: number, productId: number, input: SetMenuProductPriceInput) =>
    apiClient
      .put<ApiMenuProductPrice>(`/workspaces/${workspaceId}/menus/${menuId}/products/${productId}/price`, input)
      .then((r) => toMenuProductPrice(r.data)),

  deleteProductPrice: (workspaceId: number, menuId: number, productId: number) =>
    apiClient.delete(`/workspaces/${workspaceId}/menus/${menuId}/products/${productId}/price`),
}
