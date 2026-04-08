import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { workspacesApi } from '../api/workspaces.api'
import type { CreateWorkspaceInput } from '../types'

export const workspaceKeys = {
  all: ['workspaces'] as const,
}

export function useWorkspaces() {
  return useQuery({
    queryKey: workspaceKeys.all,
    queryFn: workspacesApi.getAll,
  })
}

export function useCreateWorkspace() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateWorkspaceInput) => workspacesApi.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: workspaceKeys.all }),
  })
}
