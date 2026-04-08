import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { categoriesApi } from '../api/categories.api'
import type { CreateCategoryInput } from '../types'

export const categoryKeys = {
  all: (workspaceId: number) => ['workspaces', workspaceId, 'categories'] as const,
}

export function useCategories(workspaceId: number) {
  return useQuery({
    queryKey: categoryKeys.all(workspaceId),
    queryFn: () => categoriesApi.getAll(workspaceId),
  })
}

export function useCreateCategory(workspaceId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateCategoryInput) => categoriesApi.create(workspaceId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: categoryKeys.all(workspaceId) }),
  })
}
