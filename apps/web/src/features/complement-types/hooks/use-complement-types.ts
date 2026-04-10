import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { complementTypesApi } from '../api/complement-types.api'
import type { CreateComplementTypeInput, CreateComplementInput } from '../types'

export const complementTypeKeys = {
  all: (workspaceId: number) => ['workspaces', workspaceId, 'complement-types'] as const,
}

export function useComplementTypes(workspaceId: number) {
  return useQuery({
    queryKey: complementTypeKeys.all(workspaceId),
    queryFn: () => complementTypesApi.getAll(workspaceId),
  })
}

export function useCreateComplementType(workspaceId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateComplementTypeInput) => complementTypesApi.create(workspaceId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: complementTypeKeys.all(workspaceId) }),
  })
}

export function useUpdateComplementType(workspaceId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...input }: { id: number } & Partial<CreateComplementTypeInput>) =>
      complementTypesApi.update(workspaceId, id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: complementTypeKeys.all(workspaceId) }),
  })
}

export function useDeleteComplementType(workspaceId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => complementTypesApi.delete(workspaceId, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: complementTypeKeys.all(workspaceId) }),
  })
}

export function useAddComplement(workspaceId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ typeId, ...input }: { typeId: number } & CreateComplementInput) =>
      complementTypesApi.addComplement(workspaceId, typeId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: complementTypeKeys.all(workspaceId) }),
  })
}

export function useUpdateComplement(workspaceId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ typeId, complementId, ...input }: { typeId: number; complementId: number } & Partial<CreateComplementInput> & { isDisabled?: boolean }) =>
      complementTypesApi.updateComplement(workspaceId, typeId, complementId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: complementTypeKeys.all(workspaceId) }),
  })
}

export function useDeleteComplement(workspaceId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ typeId, complementId }: { typeId: number; complementId: number }) =>
      complementTypesApi.deleteComplement(workspaceId, typeId, complementId),
    onSuccess: () => qc.invalidateQueries({ queryKey: complementTypeKeys.all(workspaceId) }),
  })
}
