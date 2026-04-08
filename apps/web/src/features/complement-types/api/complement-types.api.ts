import { apiClient } from '@/shared/lib/api-client'
import type { ComplementType, CreateComplementTypeInput, CreateComplementInput } from '../types'

export const complementTypesApi = {
  getAll: (workspaceId: number) =>
    apiClient.get<ComplementType[]>(`/workspaces/${workspaceId}/complement-types`).then((r) => r.data),
  create: (workspaceId: number, input: CreateComplementTypeInput) =>
    apiClient.post<ComplementType>(`/workspaces/${workspaceId}/complement-types`, input).then((r) => r.data),
  update: (workspaceId: number, id: number, input: Partial<CreateComplementTypeInput>) =>
    apiClient.patch<ComplementType>(`/workspaces/${workspaceId}/complement-types/${id}`, input).then((r) => r.data),
  delete: (workspaceId: number, id: number) =>
    apiClient.delete(`/workspaces/${workspaceId}/complement-types/${id}`),
  addComplement: (workspaceId: number, typeId: number, input: CreateComplementInput) =>
    apiClient.post(`/workspaces/${workspaceId}/complement-types/${typeId}/complements`, input).then((r) => r.data),
  updateComplement: (workspaceId: number, typeId: number, complementId: number, input: Partial<CreateComplementInput> & { is_disabled?: boolean }) =>
    apiClient.patch(`/workspaces/${workspaceId}/complement-types/${typeId}/complements/${complementId}`, input).then((r) => r.data),
  deleteComplement: (workspaceId: number, typeId: number, complementId: number) =>
    apiClient.delete(`/workspaces/${workspaceId}/complement-types/${typeId}/complements/${complementId}`),
}
