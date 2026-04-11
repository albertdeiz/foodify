import type { IProductRepository } from '../../../domain/repositories/product.repository'
import type { ComboItem, CreateComboItemInput } from '../../../domain/entities/product.entity'

export class AddComboItemUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(comboProductId: number, input: CreateComboItemInput): Promise<ComboItem> {
    return this.productRepository.addComboItem(comboProductId, input)
  }
}
