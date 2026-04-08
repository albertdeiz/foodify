export interface Category {
  id: number
  name: string
  order: number
  workspace_id: number
}

export interface CreateCategoryInput {
  name: string
}
