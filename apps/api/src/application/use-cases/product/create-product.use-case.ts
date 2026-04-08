import type { IProductRepository } from '../../../domain/repositories/product.repository'
import type { Product, CreateProductInput } from '../../../domain/entities/product.entity'

export class CreateProductUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(input: CreateProductInput): Promise<Product> {
    return this.productRepository.create(input)
  }
}
