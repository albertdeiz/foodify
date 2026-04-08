import type { ICategoryRepository } from '../../../domain/repositories/category.repository'
import type { Category, CreateCategoryInput } from '../../../domain/entities/category.entity'

export class CreateCategoryUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(input: CreateCategoryInput): Promise<Category> {
    return this.categoryRepository.create(input)
  }
}
