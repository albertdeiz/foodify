import { apiClient } from '@/shared/lib/api-client'
import type { Product, ProductWithDetails, CreateProductInput, ComboItem, CreateComboItemInput, UpdateComboItemInput } from '../types'

export const productsApi = {
  getAll: (workspaceId: number) =>
    apiClient.get<Product[]>(`/workspaces/${workspaceId}/products`).then((r) => r.data),
  getById: (workspaceId: number, id: number) =>
    apiClient.get<ProductWithDetails>(`/workspaces/${workspaceId}/products/${id}`).then((r) => r.data),
  create: (workspaceId: number, input: CreateProductInput) =>
    apiClient.post<Product>(`/workspaces/${workspaceId}/products`, input).then((r) => r.data),
  update: (workspaceId: number, id: number, input: Partial<CreateProductInput> & { is_available?: boolean }) =>
    apiClient.patch<Product>(`/workspaces/${workspaceId}/products/${id}`, input).then((r) => r.data),
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
    apiClient.get<ComboItem[]>(`/workspaces/${workspaceId}/products/${productId}/combo-items`).then((r) => r.data),
  addComboItem: (workspaceId: number, productId: number, input: CreateComboItemInput) =>
    apiClient.post<ComboItem>(`/workspaces/${workspaceId}/products/${productId}/combo-items`, input).then((r) => r.data),
  updateComboItem: (workspaceId: number, productId: number, itemId: number, input: UpdateComboItemInput) =>
    apiClient.patch<ComboItem>(`/workspaces/${workspaceId}/products/${productId}/combo-items/${itemId}`, input).then((r) => r.data),
  deleteComboItem: (workspaceId: number, productId: number, itemId: number) =>
    apiClient.delete(`/workspaces/${workspaceId}/products/${productId}/combo-items/${itemId}`),
}
