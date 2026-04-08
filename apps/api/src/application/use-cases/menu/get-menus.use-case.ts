import type { IMenuRepository } from '../../../domain/repositories/menu.repository'
import type { Menu } from '../../../domain/entities/menu.entity'

export class GetMenusUseCase {
  constructor(private readonly menuRepository: IMenuRepository) {}

  async execute(workspaceId: number): Promise<Menu[]> {
    return this.menuRepository.findByWorkspaceId(workspaceId)
  }
}
