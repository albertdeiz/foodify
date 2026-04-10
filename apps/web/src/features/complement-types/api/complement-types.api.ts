import { apiClient } from '@/shared/lib/api-client'
import type { ComplementType, ProductComplement, CreateComplementTypeInput, CreateComplementInput } from '../types'

// ─── Raw API response types ────────────────────────────────────────────────────

export interface ApiProductComplement {
  id: number
  name: string
  price: number
  increment: boolean
  is_disabled: boolean
  linked_product_id: number | null
  product_complement_type_id: number
}

export interface ApiComplementType {
  id: number
  name: string
  required: boolean
  min_selectable: number
  max_selectable: number
  workspace_id: number
  product_complements: ApiProductComplement[]
}

// ─── Transforms ────────────────────────────────────────────────────────────────

export function toProductComplement(r: ApiProductComplement): ProductComplement {
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

export function toComplementType(r: ApiComplementType): ComplementType {
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

// ─── API ───────────────────────────────────────────────────────────────────────

export const complementTypesApi = {
  getAll: (workspaceId: number) =>
    apiClient
      .get<ApiComplementType[]>(`/workspaces/${workspaceId}/complement-types`)
      .then((r) => r.data.map(toComplementType)),

  create: (workspaceId: number, input: CreateComplementTypeInput) =>
    apiClient
      .post<ApiComplementType>(`/workspaces/${workspaceId}/complement-types`, {
        name: input.name,
        required: input.required,
        min_selectable: input.minSelectable,
        max_selectable: input.maxSelectable,
      })
      .then((r) => toComplementType(r.data)),

  update: (workspaceId: number, id: number, input: Partial<CreateComplementTypeInput>) =>
    apiClient
      .patch<ApiComplementType>(`/workspaces/${workspaceId}/complement-types/${id}`, {
        name: input.name,
        required: input.required,
        min_selectable: input.minSelectable,
        max_selectable: input.maxSelectable,
      })
      .then((r) => toComplementType(r.data)),

  delete: (workspaceId: number, id: number) =>
    apiClient.delete(`/workspaces/${workspaceId}/complement-types/${id}`),

  addComplement: (workspaceId: number, typeId: number, input: CreateComplementInput) =>
    apiClient
      .post<ApiProductComplement>(`/workspaces/${workspaceId}/complement-types/${typeId}/complements`, {
        name: input.name,
        price: input.price,
        increment: input.increment,
        linked_product_id: input.linkedProductId,
      })
      .then((r) => toProductComplement(r.data)),

  updateComplement: (
    workspaceId: number,
    typeId: number,
    complementId: number,
    input: Partial<CreateComplementInput> & { isDisabled?: boolean },
  ) =>
    apiClient
      .patch<ApiProductComplement>(
        `/workspaces/${workspaceId}/complement-types/${typeId}/complements/${complementId}`,
        {
          name: input.name,
          price: input.price,
          increment: input.increment,
          linked_product_id: input.linkedProductId,
          is_disabled: input.isDisabled,
        },
      )
      .then((r) => toProductComplement(r.data)),

  deleteComplement: (workspaceId: number, typeId: number, complementId: number) =>
    apiClient.delete(
      `/workspaces/${workspaceId}/complement-types/${typeId}/complements/${complementId}`,
    ),
}
