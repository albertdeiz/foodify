import { z } from 'zod'

export const createWorkspaceSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers and hyphens'),
  address: z.string().min(1),
  currency: z.string().length(3).toUpperCase().default('EUR'),
})

export const updateWorkspaceSchema = createWorkspaceSchema.partial()

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>
