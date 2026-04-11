import type { IProductRepository } from '../../../domain/repositories/product.repository'
import type { ComboItem, UpdateComboItemInput } from '../../../domain/entities/product.entity'

export class UpdateComboItemUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(itemId: number, input: UpdateComboItemInput): Promise<ComboItem> {
    return this.productRepository.updateComboItem(itemId, input)
  }
}
