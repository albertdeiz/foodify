import type { Workspace, WorkspaceWithMenus, CreateWorkspaceInput, UpdateWorkspaceInput } from '../entities/workspace.entity'

export interface IWorkspaceRepository {
  findById(id: number): Promise<Workspace | null>
  findBySlug(slug: string): Promise<Workspace | null>
  findBySlugWithActiveMenus(slug: string): Promise<WorkspaceWithMenus | null>
  findByUserId(userId: number): Promise<Workspace[]>
  create(input: CreateWorkspaceInput, userId: number): Promise<Workspace>
  update(id: number, input: UpdateWorkspaceInput): Promise<Workspace>
  delete(id: number): Promise<void>
}
