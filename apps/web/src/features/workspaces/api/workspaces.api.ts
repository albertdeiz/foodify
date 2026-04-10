import { apiClient } from '@/shared/lib/api-client'
import type { Workspace, CreateWorkspaceInput } from '../types'

// ─── Raw API response types ────────────────────────────────────────────────────

interface ApiWorkspace {
  id: number
  name: string
  slug: string
  address: string
  created_at: string
  updated_at: string
}

// ─── Transform ─────────────────────────────────────────────────────────────────

function toWorkspace(r: ApiWorkspace): Workspace {
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    address: r.address,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}

// ─── API ───────────────────────────────────────────────────────────────────────

export const workspacesApi = {
  getAll: () =>
    apiClient.get<ApiWorkspace[]>('/workspaces').then((r) => r.data.map(toWorkspace)),

  create: (input: CreateWorkspaceInput) =>
    apiClient.post<ApiWorkspace>('/workspaces', input).then((r) => toWorkspace(r.data)),

  update: (id: number, input: Partial<CreateWorkspaceInput>) =>
    apiClient.patch<ApiWorkspace>(`/workspaces/${id}`, input).then((r) => toWorkspace(r.data)),
}
