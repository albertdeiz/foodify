import type { IProductRepository } from '../../../domain/repositories/product.repository'
import type { Product } from '../../../domain/entities/product.entity'

export class GetProductsUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(workspaceId: number): Promise<Product[]> {
    return this.productRepository.findByWorkspaceId(workspaceId)
  }
}
