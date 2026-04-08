import type { PrismaClient } from '@prisma/client'
import type { ICategoryRepository } from '../../../domain/repositories/category.repository'
import type { Category, CreateCategoryInput, UpdateCategoryInput } from '../../../domain/entities/category.entity'

export class PrismaCategoryRepository implements ICategoryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: number): Promise<Category | null> {
    return this.prisma.category.findUnique({ where: { id } })
  }

  async findByWorkspaceId(workspaceId: number): Promise<Category[]> {
    return this.prisma.category.findMany({
      where: { workspace_id: workspaceId },
      orderBy: { order: 'asc' },
    })
  }

  async create(input: CreateCategoryInput): Promise<Category> {
    return this.prisma.category.create({ data: input })
  }

  async update(id: number, input: UpdateCategoryInput): Promise<Category> {
    return this.prisma.category.update({ where: { id }, data: input })
  }

  async delete(id: number): Promise<void> {
    await this.prisma.category.delete({ where: { id } })
  }
}
