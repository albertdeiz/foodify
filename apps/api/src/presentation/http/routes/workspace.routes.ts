import type { FastifyInstance } from 'fastify'
import { CreateWorkspaceUseCase } from '../../../application/use-cases/workspace/create-workspace.use-case'
import { GetWorkspacesUseCase } from '../../../application/use-cases/workspace/get-workspaces.use-case'
import { PrismaWorkspaceRepository } from '../../../infrastructure/database/repositories/prisma-workspace.repository'
import { createWorkspaceSchema, updateWorkspaceSchema } from '../schemas/workspace.schema'
import { authMiddleware } from '../middleware/auth.middleware'

export async function workspaceRoutes(app: FastifyInstance) {
  const repository = new PrismaWorkspaceRepository(app.prisma)

  app.get('/', { preHandler: authMiddleware }, async (request) => {
    const { id } = request.user as { id: number }
    return new GetWorkspacesUseCase(repository).execute(id)
  })

  app.post('/', { preHandler: authMiddleware }, async (request, reply) => {
    const { id } = request.user as { id: number }
    const body = createWorkspaceSchema.parse(request.body)
    const workspace = await new CreateWorkspaceUseCase(repository).execute({ ...body, userId: id })
    return reply.status(201).send(workspace)
  })

  app.patch('/:id', { preHandler: authMiddleware }, async (request) => {
    const { id } = request.params as { id: string }
    const body = updateWorkspaceSchema.parse(request.body)
    return app.prisma.workspace.update({ where: { id: Number(id) }, data: body })
  })
}
