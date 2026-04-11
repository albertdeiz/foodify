import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { workspacesApi } from '../api/workspaces.api'
import type { CreateWorkspaceInput, UpdateWorkspaceInput } from '../types'

export const workspaceKeys = {
  all: ['workspaces'] as const,
}

export function useWorkspaces() {
  return useQuery({
    queryKey: workspaceKeys.all,
    queryFn: workspacesApi.getAll,
  })
}

export function useWorkspace(id: number) {
  return useQuery({
    queryKey: workspaceKeys.all,
    queryFn: workspacesApi.getAll,
    select: (workspaces) => workspaces.find((w) => w.id === id),
  })
}

export function useCreateWorkspace() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateWorkspaceInput) => workspacesApi.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: workspaceKeys.all }),
  })
}

export function useUpdateWorkspace() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateWorkspaceInput }) =>
      workspacesApi.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: workspaceKeys.all }),
  })
}
