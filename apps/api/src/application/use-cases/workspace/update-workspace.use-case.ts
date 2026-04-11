import type { IWorkspaceRepository } from '../../../domain/repositories/workspace.repository'
import type { Workspace, UpdateWorkspaceInput } from '../../../domain/entities/workspace.entity'

export class UpdateWorkspaceUseCase {
  constructor(private readonly workspaceRepository: IWorkspaceRepository) {}

  async execute(id: number, input: UpdateWorkspaceInput): Promise<Workspace> {
    return this.workspaceRepository.update(id, input)
  }
}
