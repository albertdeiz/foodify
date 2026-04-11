import { z } from 'zod'

export const createComplementTypeSchema = z.object({
  name: z.string().min(1),
  required: z.boolean().default(false),
  min_selectable: z.number().int().min(0).default(0),
  max_selectable: z.number().int().min(1).default(1),
})

export const updateComplementTypeSchema = createComplementTypeSchema.partial()

export const createComplementSchema = z.object({
  name: z.string().min(1),
  price: z.number().int().default(0),
  linked_product_id: z.number().int().nullable().optional(),
})

export const updateComplementSchema = z.object({
  name: z.string().min(1).optional(),
  price: z.number().int().optional(),
  is_disabled: z.boolean().optional(),
  linked_product_id: z.number().int().nullable().optional(),
})
