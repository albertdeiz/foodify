export interface Workspace {
  id: number
  name: string
  slug: string
  address: string
  currency: string
  created_at: Date
  updated_at: Date
}

export type CreateWorkspaceInput = Pick<Workspace, 'name' | 'slug' | 'address' | 'currency'>
export type UpdateWorkspaceInput = Partial<CreateWorkspaceInput>
