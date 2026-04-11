import type { IProductRepository } from '../../../domain/repositories/product.repository'

export class DeleteComboItemUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(itemId: number): Promise<void> {
    return this.productRepository.deleteComboItem(itemId)
  }
}
