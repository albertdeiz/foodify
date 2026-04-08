import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { menusApi } from '../api/menus.api'
import type { CreateMenuInput, SetMenuProductPriceInput } from '../types'

export const menuKeys = {
  all: (workspaceId: number) => ['workspaces', workspaceId, 'menus'] as const,
  detail: (workspaceId: number, menuId: number) => ['workspaces', workspaceId, 'menus', menuId] as const,
}

export function useMenuContent(workspaceId: number, menuId: number | null) {
  return useQuery({
    queryKey: menuKeys.detail(workspaceId, menuId!),
    queryFn: () => menusApi.getById(workspaceId, menuId!),
    enabled: !!menuId,
  })
}

export function useMenus(workspaceId: number) {
  return useQuery({
    queryKey: menuKeys.all(workspaceId),
    queryFn: () => menusApi.getAll(workspaceId),
  })
}

export function useCreateMenu(workspaceId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateMenuInput) => menusApi.create(workspaceId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: menuKeys.all(workspaceId) }),
  })
}

export function useUpdateMenu(workspaceId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...input }: { id: number } & Parameters<typeof menusApi.update>[2]) =>
      menusApi.update(workspaceId, id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: menuKeys.all(workspaceId) }),
  })
}

export function useDeleteMenu(workspaceId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => menusApi.delete(workspaceId, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: menuKeys.all(workspaceId) }),
  })
}

export function useAssignMenuCategory(workspaceId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ menuId, categoryId }: { menuId: number; categoryId: number }) =>
      menusApi.assignCategory(workspaceId, menuId, categoryId),
    onSuccess: () => qc.invalidateQueries({ queryKey: menuKeys.all(workspaceId) }),
  })
}

export function useRemoveMenuCategory(workspaceId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ menuId, categoryId }: { menuId: number; categoryId: number }) =>
      menusApi.removeCategory(workspaceId, menuId, categoryId),
    onSuccess: () => qc.invalidateQueries({ queryKey: menuKeys.all(workspaceId) }),
  })
}

export function useSetMenuProductPrice(workspaceId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ menuId, productId, ...input }: { menuId: number; productId: number } & SetMenuProductPriceInput) =>
      menusApi.setProductPrice(workspaceId, menuId, productId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: menuKeys.all(workspaceId) }),
  })
}

export function useDeleteMenuProductPrice(workspaceId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ menuId, productId }: { menuId: number; productId: number }) =>
      menusApi.deleteProductPrice(workspaceId, menuId, productId),
    onSuccess: () => qc.invalidateQueries({ queryKey: menuKeys.all(workspaceId) }),
  })
}
