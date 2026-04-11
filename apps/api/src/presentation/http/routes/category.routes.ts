import type { FastifyInstance } from 'fastify'
import { CreateCategoryUseCase } from '../../../application/use-cases/category/create-category.use-case'
import { GetCategoriesUseCase } from '../../../application/use-cases/category/get-categories.use-case'
import { UpdateCategoryUseCase } from '../../../application/use-cases/category/update-category.use-case'
import { DeleteCategoryUseCase } from '../../../application/use-cases/category/delete-category.use-case'
import { PrismaCategoryRepository } from '../../../infrastructure/database/repositories/prisma-category.repository'
import { createCategorySchema, updateCategorySchema } from '../schemas/category.schema'
import { authMiddleware } from '../middleware/auth.middleware'

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
    return new UpdateCategoryUseCase(repository).execute(Number(id), body)
  })

  app.delete('/:id', { preHandler: authMiddleware }, async (request, reply) => {
    const { id } = request.params as { id: string }
    await new DeleteCategoryUseCase(repository).execute(Number(id))
    return reply.status(204).send()
  })
}
