export interface Workspace {
  id: number
  name: string
  slug: string
  address: string
  created_at: string
  updated_at: string
}

export interface CreateWorkspaceInput {
  name: string
  slug: string
  address: string
}
