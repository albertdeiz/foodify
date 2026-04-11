import type { IProductRepository } from '../../../domain/repositories/product.repository'

export class DeleteProductUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(id: number): Promise<void> {
    return this.productRepository.delete(id)
  }
}
