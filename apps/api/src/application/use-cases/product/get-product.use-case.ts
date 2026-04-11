import type { IProductRepository } from '../../../domain/repositories/product.repository'
import type { ProductWithDetails } from '../../../domain/entities/product.entity'

export class GetProductUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(id: number): Promise<ProductWithDetails | null> {
    return this.productRepository.findByIdWithDetails(id)
  }
}
