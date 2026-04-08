export interface Workspace {
  id: number
  name: string
  slug: string
  address: string
  created_at: Date
  updated_at: Date
}

export type CreateWorkspaceInput = Pick<Workspace, 'name' | 'slug' | 'address'>
export type UpdateWorkspaceInput = Partial<CreateWorkspaceInput>
