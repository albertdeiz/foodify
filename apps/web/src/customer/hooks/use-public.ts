import { useQuery } from '@tanstack/react-query'
import { publicApi } from '../api/public.api'

export const publicKeys = {
  restaurant: (slug: string) => ['public', slug] as const,
  menu: (slug: string, menuId: number) => ['public', slug, 'menus', menuId] as const,
  product: (slug: string, productId: number) => ['public', slug, 'products', productId] as const,
}

export function useRestaurant(slug: string) {
  return useQuery({
    queryKey: publicKeys.restaurant(slug),
    queryFn: () => publicApi.getRestaurant(slug),
  })
}

export function usePublicMenu(slug: string, menuId: number | null) {
  return useQuery({
    queryKey: publicKeys.menu(slug, menuId!),
    queryFn: () => publicApi.getMenu(slug, menuId!),
    enabled: !!menuId,
  })
}

export function usePublicProductDetail(slug: string, productId: number | null) {
  return useQuery({
    queryKey: publicKeys.product(slug, productId!),
    queryFn: () => publicApi.getProductDetail(slug, productId!),
    enabled: !!productId,
    staleTime: 1000 * 60 * 5,
  })
}
