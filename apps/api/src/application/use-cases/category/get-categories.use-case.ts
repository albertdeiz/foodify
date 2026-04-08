import type { ICategoryRepository } from '../../../domain/repositories/category.repository'
import type { Category } from '../../../domain/entities/category.entity'

export class GetCategoriesUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(workspaceId: number): Promise<Category[]> {
    return this.categoryRepository.findByWorkspaceId(workspaceId)
  }
}
