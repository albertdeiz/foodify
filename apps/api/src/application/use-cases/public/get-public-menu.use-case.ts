import type { IWorkspaceRepository } from '../../../domain/repositories/workspace.repository'
import type { IMenuRepository } from '../../../domain/repositories/menu.repository'
import type { MenuWithContent } from '../../../domain/entities/menu.entity'

export class GetPublicMenuUseCase {
  constructor(
    private readonly workspaceRepository: IWorkspaceRepository,
    private readonly menuRepository: IMenuRepository,
  ) {}

  async execute(slug: string, menuId: number): Promise<MenuWithContent | null> {
    const workspace = await this.workspaceRepository.findBySlug(slug)
    if (!workspace) return null

    return this.menuRepository.findPublicByIdInWorkspace(menuId, workspace.id)
  }
}
