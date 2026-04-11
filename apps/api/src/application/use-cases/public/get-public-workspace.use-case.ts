import type { IWorkspaceRepository } from '../../../domain/repositories/workspace.repository'
import type { WorkspaceWithMenus } from '../../../domain/entities/workspace.entity'

export class GetPublicWorkspaceUseCase {
  constructor(private readonly workspaceRepository: IWorkspaceRepository) {}

  async execute(slug: string): Promise<WorkspaceWithMenus | null> {
    return this.workspaceRepository.findBySlugWithActiveMenus(slug)
  }
}
