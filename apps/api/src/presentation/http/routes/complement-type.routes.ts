import type { FastifyInstance } from 'fastify'
import { GetComplementTypesUseCase } from '../../../application/use-cases/complement-type/get-complement-types.use-case'
import { CreateComplementTypeUseCase } from '../../../application/use-cases/complement-type/create-complement-type.use-case'
import { UpdateComplementTypeUseCase } from '../../../application/use-cases/complement-type/update-complement-type.use-case'
import { DeleteComplementTypeUseCase } from '../../../application/use-cases/complement-type/delete-complement-type.use-case'
import { AddComplementUseCase } from '../../../application/use-cases/complement-type/add-complement.use-case'
import { UpdateComplementUseCase } from '../../../application/use-cases/complement-type/update-complement.use-case'
import { DeleteComplementUseCase } from '../../../application/use-cases/complement-type/delete-complement.use-case'
import { PrismaComplementTypeRepository } from '../../../infrastructure/database/repositories/prisma-complement-type.repository'
import {
  createComplementTypeSchema,
  updateComplementTypeSchema,
  createComplementSchema,
  updateComplementSchema,
} from '../schemas/complement-type.schema'
import { authMiddleware } from '../middleware/auth.middleware'

export async function complementTypeRoutes(app: FastifyInstance) {
  const repository = new PrismaComplementTypeRepository(app.prisma)

  app.get('/', { preHandler: authMiddleware }, async (request) => {
    const { workspaceId } = request.params as { workspaceId: string }
    return new GetComplementTypesUseCase(repository).execute(Number(workspaceId))
  })

  app.post('/', { preHandler: authMiddleware }, async (request, reply) => {
    const { workspaceId } = request.params as { workspaceId: string }
    const body = createComplementTypeSchema.parse(request.body)
    const type = await new CreateComplementTypeUseCase(repository).execute({
      ...body,
      workspace_id: Number(workspaceId),
    })
    return reply.status(201).send(type)
  })

  app.patch('/:id', { preHandler: authMiddleware }, async (request) => {
    const { id } = request.params as { id: string }
    const body = updateComplementTypeSchema.parse(request.body)
    return new UpdateComplementTypeUseCase(repository).execute(Number(id), body)
  })

  app.delete('/:id', { preHandler: authMiddleware }, async (request, reply) => {
    const { id } = request.params as { id: string }
    await new DeleteComplementTypeUseCase(repository).execute(Number(id))
    return reply.status(204).send()
  })

  // Opciones dentro de un tipo de complemento
  app.post('/:id/complements', { preHandler: authMiddleware }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const body = createComplementSchema.parse(request.body)
    const complement = await new AddComplementUseCase(repository).execute(Number(id), body)
    return reply.status(201).send(complement)
  })

  app.patch('/:id/complements/:complementId', { preHandler: authMiddleware }, async (request) => {
    const { complementId } = request.params as { complementId: string }
    const body = updateComplementSchema.parse(request.body)
    return new UpdateComplementUseCase(repository).execute(Number(complementId), body)
  })

  app.delete('/:id/complements/:complementId', { preHandler: authMiddleware }, async (request, reply) => {
    const { complementId } = request.params as { complementId: string }
    await new DeleteComplementUseCase(repository).execute(Number(complementId))
    return reply.status(204).send()
  })
}
