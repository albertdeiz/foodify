import { z } from 'zod'

export const createCategorySchema = z.object({
  name: z.string().min(1),
})

export const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  order: z.number().int().optional(),
})
