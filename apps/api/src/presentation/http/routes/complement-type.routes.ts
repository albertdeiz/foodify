import type { FastifyInstance } from 'fastify'
import { PrismaComplementTypeRepository } from '../../../infrastructure/database/repositories/prisma-complement-type.repository'
import { authMiddleware } from '../middleware/auth.middleware'
import { z } from 'zod'

const createTypeSchema = z.object({
  name: z.string().min(1),
  required: z.boolean().default(false),
  min_selectable: z.number().int().min(0).default(0),
  max_selectable: z.number().int().min(1).default(1),
})

const updateTypeSchema = createTypeSchema.partial()

const createComplementSchema = z.object({
  name: z.string().min(1),
  price: z.number().int().default(0),           // permite negativos (ej: tamaño pequeño -50¢)
  linked_product_id: z.number().int().nullable().optional(), // apunta a producto real para combos
})

const updateComplementSchema = z.object({
  name: z.string().min(1).optional(),
  price: z.number().int().optional(),
  is_disabled: z.boolean().optional(),
  linked_product_id: z.number().int().nullable().optional(),
})

export async function complementTypeRoutes(app: FastifyInstance) {
  const repository = new PrismaComplementTypeRepository(app.prisma)

  app.get('/', { preHandler: authMiddleware }, async (request) => {
    const { workspaceId } = request.params as { workspaceId: string }
    return repository.findByWorkspaceId(Number(workspaceId))
  })

  app.post('/', { preHandler: authMiddleware }, async (request, reply) => {
    const { workspaceId } = request.params as { workspaceId: string }
    const body = createTypeSchema.parse(request.body)
    const type = await repository.create({ ...body, workspace_id: Number(workspaceId) })
    return reply.status(201).send(type)
  })

  app.patch('/:id', { preHandler: authMiddleware }, async (request) => {
    const { id } = request.params as { id: string }
    const body = updateTypeSchema.parse(request.body)
    return repository.update(Number(id), body)
  })

  app.delete('/:id', { preHandler: authMiddleware }, async (request, reply) => {
    const { id } = request.params as { id: string }
    await repository.delete(Number(id))
    return reply.status(204).send()
  })

  // Opciones dentro de un tipo de complemento
  app.post('/:id/complements', { preHandler: authMiddleware }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const body = createComplementSchema.parse(request.body)
    const complement = await repository.addComplement(Number(id), body)
    return reply.status(201).send(complement)
  })

  app.patch('/:id/complements/:complementId', { preHandler: authMiddleware }, async (request) => {
    const { complementId } = request.params as { complementId: string }
    const body = updateComplementSchema.parse(request.body)
    return repository.updateComplement(Number(complementId), body)
  })

  app.delete('/:id/complements/:complementId', { preHandler: authMiddleware }, async (request, reply) => {
    const { complementId } = request.params as { complementId: string }
    await repository.deleteComplement(Number(complementId))
    return reply.status(204).send()
  })
}
