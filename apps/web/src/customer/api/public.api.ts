import { publicClient } from './public-client'
import type { PublicWorkspace, PublicMenu, PublicProductDetail } from '../types'

export const publicApi = {
  getRestaurant: (slug: string) =>
    publicClient.get<PublicWorkspace>(`/public/${slug}`).then((r) => r.data),
  getMenu: (slug: string, menuId: number) =>
    publicClient.get<PublicMenu>(`/public/${slug}/menus/${menuId}`).then((r) => r.data),
  getProductDetail: (slug: string, productId: number) =>
    publicClient.get<PublicProductDetail>(`/public/${slug}/products/${productId}`).then((r) => r.data),
}
