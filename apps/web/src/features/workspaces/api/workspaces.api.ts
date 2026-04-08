import { apiClient } from '@/shared/lib/api-client'
import type { Workspace, CreateWorkspaceInput } from '../types'

export const workspacesApi = {
  getAll: () =>
    apiClient.get<Workspace[]>('/workspaces').then((r) => r.data),
  create: (input: CreateWorkspaceInput) =>
    apiClient.post<Workspace>('/workspaces', input).then((r) => r.data),
  update: (id: number, input: Partial<CreateWorkspaceInput>) =>
    apiClient.patch<Workspace>(`/workspaces/${id}`, input).then((r) => r.data),
}
