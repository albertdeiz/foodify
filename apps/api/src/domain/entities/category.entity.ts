export interface Category {
  id: number
  name: string
  order: number
  workspace_id: number
}

export type CreateCategoryInput = Pick<Category, 'name' | 'workspace_id'>
export type UpdateCategoryInput = Partial<Pick<Category, 'name' | 'order'>>
