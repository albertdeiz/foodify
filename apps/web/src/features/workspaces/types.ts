export interface Workspace {
  id: number
  name: string
  slug: string
  address: string
  createdAt: string
  updatedAt: string
}

export interface CreateWorkspaceInput {
  name: string
  slug: string
  address: string
}
