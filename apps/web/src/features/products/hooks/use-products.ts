import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productsApi } from '../api/products.api'
import type { CreateProductInput, CreateComboItemInput, UpdateComboItemInput } from '../types'

export const productKeys = {
  all: (workspaceId: number) => ['workspaces', workspaceId, 'products'] as const,
  detail: (workspaceId: number, id: number) => ['workspaces', workspaceId, 'products', id] as const,
  comboItems: (workspaceId: number, id: number) => ['workspaces', workspaceId, 'products', id, 'combo-items'] as const,
}

export function useProducts(workspaceId: number) {
  return useQuery({
    queryKey: productKeys.all(workspaceId),
    queryFn: () => productsApi.getAll(workspaceId),
  })
}

export function useProductDetail(workspaceId: number, productId: number | null) {
  return useQuery({
    queryKey: productKeys.detail(workspaceId, productId!),
    queryFn: () => productsApi.getById(workspaceId, productId!),
    enabled: !!productId,
  })
}

export function useComboItems(workspaceId: number, productId: number | null) {
  return useQuery({
    queryKey: productKeys.comboItems(workspaceId, productId!),
    queryFn: () => productsApi.getComboItems(workspaceId, productId!),
    enabled: !!productId,
  })
}

export function useCreateProduct(workspaceId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateProductInput) => productsApi.create(workspaceId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.all(workspaceId) }),
  })
}

export function useUpdateProduct(workspaceId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...input }: { id: number } & Parameters<typeof productsApi.update>[2]) =>
      productsApi.update(workspaceId, id, input),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: productKeys.all(workspaceId) })
      qc.invalidateQueries({ queryKey: productKeys.detail(workspaceId, id) })
    },
  })
}

export function useDeleteProduct(workspaceId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => productsApi.delete(workspaceId, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.all(workspaceId) }),
  })
}

export function useToggleProductAvailability(workspaceId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, is_available }: { id: number; is_available: boolean }) =>
      productsApi.update(workspaceId, id, { is_available }),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.all(workspaceId) }),
  })
}

export function useAssignProductToCategory(workspaceId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ productId, categoryId }: { productId: number; categoryId: number }) =>
      productsApi.assignToCategory(workspaceId, productId, categoryId),
    onSuccess: (_, { productId }) =>
      qc.invalidateQueries({ queryKey: productKeys.detail(workspaceId, productId) }),
  })
}

export function useRemoveProductFromCategory(workspaceId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ productId, categoryId }: { productId: number; categoryId: number }) =>
      productsApi.removeFromCategory(workspaceId, productId, categoryId),
    onSuccess: (_, { productId }) =>
      qc.invalidateQueries({ queryKey: productKeys.detail(workspaceId, productId) }),
  })
}

export function useAssignComplementType(workspaceId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ productId, typeId }: { productId: number; typeId: number }) =>
      productsApi.assignComplementType(workspaceId, productId, typeId),
    onSuccess: (_, { productId }) =>
      qc.invalidateQueries({ queryKey: productKeys.detail(workspaceId, productId) }),
  })
}

export function useRemoveComplementType(workspaceId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ productId, typeId }: { productId: number; typeId: number }) =>
      productsApi.removeComplementType(workspaceId, productId, typeId),
    onSuccess: (_, { productId }) =>
      qc.invalidateQueries({ queryKey: productKeys.detail(workspaceId, productId) }),
  })
}

export function useAddComboItem(workspaceId: number, productId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateComboItemInput) => productsApi.addComboItem(workspaceId, productId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.comboItems(workspaceId, productId) }),
  })
}

export function useUpdateComboItem(workspaceId: number, productId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ itemId, ...input }: { itemId: number } & UpdateComboItemInput) =>
      productsApi.updateComboItem(workspaceId, productId, itemId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.comboItems(workspaceId, productId) }),
  })
}

export function useDeleteComboItem(workspaceId: number, productId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (itemId: number) => productsApi.deleteComboItem(workspaceId, productId, itemId),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.comboItems(workspaceId, productId) }),
  })
}
