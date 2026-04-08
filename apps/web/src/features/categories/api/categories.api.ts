import { apiClient } from '@/shared/lib/api-client'
import type { Category, CreateCategoryInput } from '../types'

export const categoriesApi = {
  getAll: (workspaceId: number) =>
    apiClient.get<Category[]>(`/workspaces/${workspaceId}/categories`).then((r) => r.data),
  create: (workspaceId: number, input: CreateCategoryInput) =>
    apiClient.post<Category>(`/workspaces/${workspaceId}/categories`, input).then((r) => r.data),
  update: (workspaceId: number, id: number, input: Partial<Category>) =>
    apiClient.patch<Category>(`/workspaces/${workspaceId}/categories/${id}`, input).then((r) => r.data),
  delete: (workspaceId: number, id: number) =>
    apiClient.delete(`/workspaces/${workspaceId}/categories/${id}`),
}
