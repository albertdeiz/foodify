import type { Category, CreateCategoryInput, UpdateCategoryInput } from '../entities/category.entity'

export interface ICategoryRepository {
  findById(id: number): Promise<Category | null>
  findByWorkspaceId(workspaceId: number): Promise<Category[]>
  create(input: CreateCategoryInput): Promise<Category>
  update(id: number, input: UpdateCategoryInput): Promise<Category>
  delete(id: number): Promise<void>
}
