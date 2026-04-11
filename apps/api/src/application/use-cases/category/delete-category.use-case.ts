import type { ICategoryRepository } from '../../../domain/repositories/category.repository'

export class DeleteCategoryUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(id: number): Promise<void> {
    return this.categoryRepository.delete(id)
  }
}
