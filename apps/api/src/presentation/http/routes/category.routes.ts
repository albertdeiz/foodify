import type { FastifyInstance } from 'fastify'
import { CreateCategoryUseCase } from '../../../application/use-cases/category/create-category.use-case'
import { GetCategoriesUseCase } from '../../../application/use-cases/category/get-categories.use-case'
import { PrismaCategoryRepository } from '../../../infrastructure/database/repositories/prisma-category.repository'
import { authMiddleware } from '../middleware/auth.middleware'
import { z } from 'zod'

const createCategorySchema = z.object({ name: z.string().min(1) })
const updateCategorySchema = z.object({ name: z.string().min(1).optional(), order: z.number().int().optional() })

export async function categoryRoutes(app: FastifyInstance) {
  const repository = new PrismaCategoryRepository(app.prisma)

  app.get('/', { preHandler: authMiddleware }, async (request) => {
    const { workspaceId } = request.params as { workspaceId: string }
    return new GetCategoriesUseCase(repository).execute(Number(workspaceId))
  })

  app.post('/', { preHandler: authMiddleware }, async (request, reply) => {
    const { workspaceId } = request.params as { workspaceId: string }
    const body = createCategorySchema.parse(request.body)
    const category = await new CreateCategoryUseCase(repository).execute({
      ...body,
      workspace_id: Number(workspaceId),
    })
    return reply.status(201).send(category)
  })

  app.patch('/:id', { preHandler: authMiddleware }, async (request) => {
    const { id } = request.params as { id: string }
    const body = updateCategorySchema.parse(request.body)
    return repository.update(Number(id), body)
  })

  app.delete('/:id', { preHandler: authMiddleware }, async (request, reply) => {
    const { id } = request.params as { id: string }
    await repository.delete(Number(id))
    return reply.status(204).send()
  })
}
