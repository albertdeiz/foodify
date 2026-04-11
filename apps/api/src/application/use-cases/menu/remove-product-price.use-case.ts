import type { IMenuRepository } from '../../../domain/repositories/menu.repository'

export class RemoveProductPriceUseCase {
  constructor(private readonly menuRepository: IMenuRepository) {}

  async execute(menuId: number, productId: number): Promise<void> {
    return this.menuRepository.removeProductPrice(menuId, productId)
  }
}
