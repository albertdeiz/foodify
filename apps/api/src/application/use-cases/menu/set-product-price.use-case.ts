import type { IMenuRepository } from '../../../domain/repositories/menu.repository'

export class SetProductPriceUseCase {
  constructor(private readonly menuRepository: IMenuRepository) {}

  async execute(menuId: number, productId: number, price: number): Promise<void> {
    return this.menuRepository.setProductPrice(menuId, productId, price)
  }
}
