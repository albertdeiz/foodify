import { apiClient } from '@/shared/lib/api-client'
import type { Category, CreateCategoryInput } from '../types'

// ─── Raw API response types ────────────────────────────────────────────────────

interface ApiCategory {
  id: number
  name: string
  order: number
  workspace_id: number
}

// ─── Transform ─────────────────────────────────────────────────────────────────

function toCategory(r: ApiCategory): Category {
  return { id: r.id, name: r.name, order: r.order, workspaceId: r.workspace_id }
}

// ─── API ───────────────────────────────────────────────────────────────────────

export const categoriesApi = {
  getAll: (workspaceId: number) =>
    apiClient
      .get<ApiCategory[]>(`/workspaces/${workspaceId}/categories`)
      .then((r) => r.data.map(toCategory)),

  create: (workspaceId: number, input: CreateCategoryInput) =>
    apiClient
      .post<ApiCategory>(`/workspaces/${workspaceId}/categories`, input)
      .then((r) => toCategory(r.data)),

  update: (workspaceId: number, id: number, input: Partial<Pick<Category, 'name' | 'order'>>) =>
    apiClient
      .patch<ApiCategory>(`/workspaces/${workspaceId}/categories/${id}`, input)
      .then((r) => toCategory(r.data)),

  delete: (workspaceId: number, id: number) =>
    apiClient.delete(`/workspaces/${workspaceId}/categories/${id}`),
}
