import type { IProductRepository } from '../../../domain/repositories/product.repository'
import type { Product, UpdateProductInput } from '../../../domain/entities/product.entity'

export class UpdateProductUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(id: number, input: UpdateProductInput): Promise<Product> {
    return this.productRepository.update(id, input)
  }
}
