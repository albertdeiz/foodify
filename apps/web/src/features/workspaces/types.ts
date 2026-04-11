import type { Currency } from '@/shared/lib/currency'

export interface Workspace {
  id: number
  name: string
  slug: string
  address: string
  currency: Currency
  createdAt: string
  updatedAt: string
}

export interface CreateWorkspaceInput {
  name: string
  slug: string
  address: string
  currency: Currency
}

export type UpdateWorkspaceInput = Partial<CreateWorkspaceInput>
