import type { IMenuRepository } from '../../../domain/repositories/menu.repository'

export class AssignCategoryToMenuUseCase {
  constructor(private readonly menuRepository: IMenuRepository) {}

  async execute(menuId: number, categoryId: number): Promise<void> {
    return this.menuRepository.assignCategory(menuId, categoryId)
  }
}
