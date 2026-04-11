import type { PrismaClient } from '@prisma/client'
import type { IWorkspaceRepository } from '../../../domain/repositories/workspace.repository'
import type { Workspace, WorkspaceWithMenus, CreateWorkspaceInput, UpdateWorkspaceInput } from '../../../domain/entities/workspace.entity'

export class PrismaWorkspaceRepository implements IWorkspaceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: number): Promise<Workspace | null> {
    return this.prisma.workspace.findUnique({ where: { id } })
  }

  async findBySlug(slug: string): Promise<Workspace | null> {
    return this.prisma.workspace.findUnique({ where: { slug } })
  }

  async findBySlugWithActiveMenus(slug: string): Promise<WorkspaceWithMenus | null> {
    return this.prisma.workspace.findUnique({
      where: { slug },
      include: {
        menus: {
          where: { is_active: true },
          select: { id: true, name: true },
        },
      },
    })
  }

  async findByUserId(userId: number): Promise<Workspace[]> {
    const records = await this.prisma.userWorkspace.findMany({
      where: { user_id: userId },
      include: { workspace: true },
    })
    return records.map((r) => r.workspace)
  }

  async create(input: CreateWorkspaceInput, userId: number): Promise<Workspace> {
    return this.prisma.workspace.create({
      data: {
        ...input,
        user_workspaces: { create: { user_id: userId } },
      },
    })
  }

  async update(id: number, input: UpdateWorkspaceInput): Promise<Workspace> {
    return this.prisma.workspace.update({ where: { id }, data: input })
  }

  async delete(id: number): Promise<void> {
    await this.prisma.workspace.delete({ where: { id } })
  }
}
