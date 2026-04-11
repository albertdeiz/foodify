import type { ICategoryRepository } from '../../../domain/repositories/category.repository'
import type { Category, UpdateCategoryInput } from '../../../domain/entities/category.entity'

export class UpdateCategoryUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(id: number, input: UpdateCategoryInput): Promise<Category> {
    return this.categoryRepository.update(id, input)
  }
}
