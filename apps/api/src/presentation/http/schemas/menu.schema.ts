import { z } from 'zod'

export const createMenuSchema = z.object({
  name: z.string().min(1),
})

export const updateMenuSchema = z.object({
  name: z.string().min(1).optional(),
  is_active: z.boolean().optional(),
})

export type CreateMenuInput = z.infer<typeof createMenuSchema>
export type UpdateMenuInput = z.infer<typeof updateMenuSchema>
