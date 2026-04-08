import type { PrismaClient } from '@prisma/client'
import type { IUserRepository } from '../../../domain/repositories/user.repository'
import type { User, CreateUserInput } from '../../../domain/entities/user.entity'

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } })
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } })
  }

  async create(input: CreateUserInput): Promise<User> {
    return this.prisma.user.create({ data: input })
  }
}
