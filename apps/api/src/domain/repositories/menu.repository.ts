import type { Menu, MenuWithContent, CreateMenuInput, UpdateMenuInput } from '../entities/menu.entity'

export interface IMenuRepository {
  findById(id: number): Promise<Menu | null>
  findByIdWithContent(id: number): Promise<MenuWithContent | null>
  findPublicByIdInWorkspace(menuId: number, workspaceId: number): Promise<MenuWithContent | null>
  findByWorkspaceId(workspaceId: number): Promise<Menu[]>
  findActiveByWorkspaceId(workspaceId: number): Promise<Menu[]>
  create(input: CreateMenuInput): Promise<Menu>
  update(id: number, input: UpdateMenuInput): Promise<Menu>
  delete(id: number): Promise<void>
  assignCategory(menuId: number, categoryId: number, order?: number): Promise<void>
  removeCategory(menuId: number, categoryId: number): Promise<void>
  setProductPrice(menuId: number, productId: number, price: number): Promise<void>
  removeProductPrice(menuId: number, productId: number): Promise<void>
}
