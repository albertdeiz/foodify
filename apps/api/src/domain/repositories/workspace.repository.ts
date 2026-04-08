import type { Workspace, CreateWorkspaceInput, UpdateWorkspaceInput } from '../entities/workspace.entity'

export interface IWorkspaceRepository {
  findById(id: number): Promise<Workspace | null>
  findBySlug(slug: string): Promise<Workspace | null>
  findByUserId(userId: number): Promise<Workspace[]>
  create(input: CreateWorkspaceInput, userId: number): Promise<Workspace>
  update(id: number, input: UpdateWorkspaceInput): Promise<Workspace>
  delete(id: number): Promise<void>
}
