import type { IWorkspaceRepository } from '../../../domain/repositories/workspace.repository'
import type { IProductRepository } from '../../../domain/repositories/product.repository'
import type { PublicProductDetail } from '../../../domain/entities/product.entity'

export class GetPublicProductUseCase {
  constructor(
    private readonly workspaceRepository: IWorkspaceRepository,
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(slug: string, productId: number): Promise<PublicProductDetail | null> {
    const workspace = await this.workspaceRepository.findBySlug(slug)
    if (!workspace) return null

    return this.productRepository.findPublicByIdInWorkspace(productId, workspace.id)
  }
}
