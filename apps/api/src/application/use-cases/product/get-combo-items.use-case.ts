import type { IProductRepository } from '../../../domain/repositories/product.repository'
import type { ComboItem } from '../../../domain/entities/product.entity'

export class GetComboItemsUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(comboProductId: number): Promise<ComboItem[]> {
    return this.productRepository.findComboItems(comboProductId)
  }
}
