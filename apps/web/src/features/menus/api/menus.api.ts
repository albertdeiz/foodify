import { apiClient } from '@/shared/lib/api-client'
import type { Menu, MenuWithContent, CreateMenuInput, MenuProductPrice, SetMenuProductPriceInput } from '../types'

export const menusApi = {
  getAll: (workspaceId: number) =>
    apiClient.get<Menu[]>(`/workspaces/${workspaceId}/menus`).then((r) => r.data),
  getById: (workspaceId: number, menuId: number) =>
    apiClient.get<MenuWithContent>(`/workspaces/${workspaceId}/menus/${menuId}`).then((r) => r.data),
  create: (workspaceId: number, input: CreateMenuInput) =>
    apiClient.post<Menu>(`/workspaces/${workspaceId}/menus`, input).then((r) => r.data),
  update: (workspaceId: number, id: number, input: Partial<Pick<Menu, 'name' | 'is_active'>>) =>
    apiClient.patch<Menu>(`/workspaces/${workspaceId}/menus/${id}`, input).then((r) => r.data),
  delete: (workspaceId: number, id: number) =>
    apiClient.delete(`/workspaces/${workspaceId}/menus/${id}`),
  assignCategory: (workspaceId: number, menuId: number, categoryId: number) =>
    apiClient.post(`/workspaces/${workspaceId}/menus/${menuId}/categories/${categoryId}`),
  removeCategory: (workspaceId: number, menuId: number, categoryId: number) =>
    apiClient.delete(`/workspaces/${workspaceId}/menus/${menuId}/categories/${categoryId}`),
  setProductPrice: (workspaceId: number, menuId: number, productId: number, input: SetMenuProductPriceInput) =>
    apiClient.put<MenuProductPrice>(`/workspaces/${workspaceId}/menus/${menuId}/products/${productId}/price`, input).then((r) => r.data),
  deleteProductPrice: (workspaceId: number, menuId: number, productId: number) =>
    apiClient.delete(`/workspaces/${workspaceId}/menus/${menuId}/products/${productId}/price`),
}
