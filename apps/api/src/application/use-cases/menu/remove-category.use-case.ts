import type { IMenuRepository } from '../../../domain/repositories/menu.repository'

export class RemoveCategoryFromMenuUseCase {
  constructor(private readonly menuRepository: IMenuRepository) {}

  async execute(menuId: number, categoryId: number): Promise<void> {
    return this.menuRepository.removeCategory(menuId, categoryId)
  }
}
