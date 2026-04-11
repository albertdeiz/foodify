import type { IWorkspaceRepository } from '../../../domain/repositories/workspace.repository'
import type { Workspace } from '../../../domain/entities/workspace.entity'

interface CreateWorkspaceInput {
  name: string
  slug: string
  address: string
  currency: string
  userId: number
}

export class CreateWorkspaceUseCase {
  constructor(private readonly workspaceRepository: IWorkspaceRepository) {}

  async execute(input: CreateWorkspaceInput): Promise<Workspace> {
    const existing = await this.workspaceRepository.findBySlug(input.slug)
    if (existing) throw new Error('Slug already taken')

    const { userId, ...data } = input
    return this.workspaceRepository.create(data, userId)
  }
}
