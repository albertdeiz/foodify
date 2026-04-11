export interface Workspace {
  id: number
  name: string
  slug: string
  address: string
  currency: string
  created_at: Date
  updated_at: Date
}

export interface WorkspaceWithMenus extends Workspace {
  menus: Array<{ id: number; name: string }>
}

export type CreateWorkspaceInput = Pick<Workspace, 'name' | 'slug' | 'address' | 'currency'>
export type UpdateWorkspaceInput = Partial<CreateWorkspaceInput>
