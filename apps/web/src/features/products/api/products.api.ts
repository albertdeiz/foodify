import { apiClient } from '@/shared/lib/api-client'
import type { Product, ProductWithDetails, CreateProductInput, ComboItem, CreateComboItemInput, UpdateComboItemInput } from '../types'
import type { ComplementType, ProductComplement } from '@/features/complement-types/types'

// ─── Raw API response types ────────────────────────────────────────────────────

interface ApiProductComplement {
  id: number
  name: string
  price: number
  increment: boolean
  is_disabled: boolean
  linked_product_id: number | null
  product_complement_type_id: number
}

interface ApiComplementType {
  id: number
  name: string
  required: boolean
  min_selectable: number
  max_selectable: number
  workspace_id: number
  product_complements: ApiProductComplement[]
}

interface ApiProduct {
  id: number
  name: string
  description: string
  price: number
  image_url: string | null
  type: string
  is_available: boolean
  content: string | null
  workspace_id: number
  created_at: string
  updated_at: string
}

interface ApiComboItem {
  id: number
  order: number
  product_id: number | null
  product: ApiProduct | null
}

interface ApiProductWithDetails extends ApiProduct {
  complement_types: ApiComplementType[]
  combo_items: ApiComboItem[]
}

// ─── Transforms ────────────────────────────────────────────────────────────────

function toProductComplement(r: ApiProductComplement): ProductComplement {
  return {
    id: r.id,
    name: r.name,
    price: r.price,
    increment: r.increment,
    isDisabled: r.is_disabled,
    linkedProductId: r.linked_product_id,
    productComplementTypeId: r.product_complement_type_id,
  }
}

function toComplementType(r: ApiComplementType): ComplementType {
  return {
    id: r.id,
    name: r.name,
    required: r.required,
    minSelectable: r.min_selectable,
    maxSelectable: r.max_selectable,
    workspaceId: r.workspace_id,
    productComplements: r.product_complements.map(toProductComplement),
  }
}

function toProduct(r: ApiProduct): Product {
  return {
    id: r.id,
    name: r.name,
    description: r.description,
    price: r.price,
    imageUrl: r.image_url,
    type: r.type as Product['type'],
    isAvailable: r.is_available,
    content: r.content,
    workspaceId: r.workspace_id,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}

function toComboItem(r: ApiComboItem): ComboItem {
  return {
    id: r.id,
    order: r.order,
    productId: r.product_id,
    product: r.product ? toProduct(r.product) : null,
  }
}

function toProductWithDetails(r: ApiProductWithDetails): ProductWithDetails {
  return {
    ...toProduct(r),
    complementTypes: r.complement_types.map(toComplementType),
    comboItems: r.combo_items.map(toComboItem),
  }
}

// ─── API ───────────────────────────────────────────────────────────────────────

export const productsApi = {
  getAll: (workspaceId: number) =>
    apiClient
      .get<ApiProduct[]>(`/workspaces/${workspaceId}/products`)
      .then((r) => r.data.map(toProduct)),

  getById: (workspaceId: number, id: number) =>
    apiClient
      .get<ApiProductWithDetails>(`/workspaces/${workspaceId}/products/${id}`)
      .then((r) => toProductWithDetails(r.data)),

  create: (workspaceId: number, input: CreateProductInput) =>
    apiClient
      .post<ApiProduct>(`/workspaces/${workspaceId}/products`, {
        name: input.name,
        description: input.description,
        price: input.price,
        image_url: input.imageUrl,
        type: input.type,
        content: input.content,
        is_available: input.isAvailable,
      })
      .then((r) => toProduct(r.data)),

  update: (workspaceId: number, id: number, input: Partial<CreateProductInput>) =>
    apiClient
      .patch<ApiProduct>(`/workspaces/${workspaceId}/products/${id}`, {
        name: input.name,
        description: input.description,
        price: input.price,
        image_url: input.imageUrl,
        type: input.type,
        content: input.content,
        is_available: input.isAvailable,
      })
      .then((r) => toProduct(r.data)),

  delete: (workspaceId: number, id: number) =>
    apiClient.delete(`/workspaces/${workspaceId}/products/${id}`),

  assignToCategory: (workspaceId: number, productId: number, categoryId: number) =>
    apiClient.post(`/workspaces/${workspaceId}/products/${productId}/categories/${categoryId}`),

  removeFromCategory: (workspaceId: number, productId: number, categoryId: number) =>
    apiClient.delete(`/workspaces/${workspaceId}/products/${productId}/categories/${categoryId}`),

  assignComplementType: (workspaceId: number, productId: number, typeId: number) =>
    apiClient.post(`/workspaces/${workspaceId}/products/${productId}/complement-types/${typeId}`),

  removeComplementType: (workspaceId: number, productId: number, typeId: number) =>
    apiClient.delete(`/workspaces/${workspaceId}/products/${productId}/complement-types/${typeId}`),

  getComboItems: (workspaceId: number, productId: number) =>
    apiClient
      .get<ApiComboItem[]>(`/workspaces/${workspaceId}/products/${productId}/combo-items`)
      .then((r) => r.data.map(toComboItem)),

  addComboItem: (workspaceId: number, productId: number, input: CreateComboItemInput) =>
    apiClient
      .post<ApiComboItem>(`/workspaces/${workspaceId}/products/${productId}/combo-items`, {
        product_id: input.productId,
        order: input.order,
      })
      .then((r) => toComboItem(r.data)),

  updateComboItem: (workspaceId: number, productId: number, itemId: number, input: UpdateComboItemInput) =>
    apiClient
      .patch<ApiComboItem>(
        `/workspaces/${workspaceId}/products/${productId}/combo-items/${itemId}`,
        input,
      )
      .then((r) => toComboItem(r.data)),

  deleteComboItem: (workspaceId: number, productId: number, itemId: number) =>
    apiClient.delete(`/workspaces/${workspaceId}/products/${productId}/combo-items/${itemId}`),
}
