import type { FastifyInstance } from 'fastify'
import { RegisterUseCase } from '../../../application/use-cases/auth/register.use-case'
import { LoginUseCase } from '../../../application/use-cases/auth/login.use-case'
import { PrismaUserRepository } from '../../../infrastructure/database/repositories/prisma-user.repository'
import { registerSchema, loginSchema } from '../schemas/auth.schema'

export async function authRoutes(app: FastifyInstance) {
  const userRepository = new PrismaUserRepository(app.prisma)

  app.post('/register', async (request, reply) => {
    const body = registerSchema.parse(request.body)
    const useCase = new RegisterUseCase(userRepository)
    const user = await useCase.execute(body)
    const token = app.jwt.sign({ id: user.id, email: user.email })
    return reply.status(201).send({ user, token })
  })

  app.post('/login', async (request, reply) => {
    const body = loginSchema.parse(request.body)
    const useCase = new LoginUseCase(userRepository)
    const user = await useCase.execute(body)
    const token = app.jwt.sign({ id: user.id, email: user.email })
    return reply.send({ user, token })
  })
}
