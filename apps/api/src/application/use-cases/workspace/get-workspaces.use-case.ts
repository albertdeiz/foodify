import type { IWorkspaceRepository } from '../../../domain/repositories/workspace.repository'
import type { Workspace } from '../../../domain/entities/workspace.entity'

export class GetWorkspacesUseCase {
  constructor(private readonly workspaceRepository: IWorkspaceRepository) {}

  async execute(userId: number): Promise<Workspace[]> {
    return this.workspaceRepository.findByUserId(userId)
  }
}
