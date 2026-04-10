export interface Category {
  id: number
  name: string
  order: number
  workspaceId: number
}

export interface CreateCategoryInput {
  name: string
}
