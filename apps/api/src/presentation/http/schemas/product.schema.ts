import { z } from 'zod'

export const createProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().int().min(0),
  image_url: z.string().url().optional(),
  type: z.enum(['REGULAR', 'COMPLEMENTED', 'COMBO']).default('REGULAR'),
  content: z.string().optional(),
})

export const updateProductSchema = createProductSchema.partial().extend({
  is_available: z.boolean().optional(),
})

export const createComboItemSchema = z.object({
  product_id: z.number().int().nullable().optional(),
  order: z.number().int().min(0).optional(),
})

export const updateComboItemSchema = createComboItemSchema

export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
export type CreateComboItemInput = z.infer<typeof createComboItemSchema>
export type UpdateComboItemInput = z.infer<typeof updateComboItemSchema>
