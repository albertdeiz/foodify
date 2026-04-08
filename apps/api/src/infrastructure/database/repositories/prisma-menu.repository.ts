import type { PrismaClient } from '@prisma/client'
import type { IMenuRepository } from '../../../domain/repositories/menu.repository'
import type { Menu, MenuWithContent, CreateMenuInput, UpdateMenuInput } from '../../../domain/entities/menu.entity'

export class PrismaMenuRepository implements IMenuRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: number): Promise<Menu | null> {
    return this.prisma.menu.findUnique({ where: { id } })
  }

  async findByIdWithContent(menuId: number): Promise<MenuWithContent | null> {
    const raw = await this.prisma.menu.findUnique({
      where: { id: menuId },
      include: {
        menu_categories: {
          orderBy: { order: 'asc' },
          include: {
            category: {
              include: {
                product_categories: {
                  orderBy: { order: 'asc' },
                  include: { product: true },
                },
              },
            },
          },
        },
        menu_product_prices: true,
      },
    })
    if (!raw) return null

    const priceMap = new Map(raw.menu_product_prices.map((p) => [p.product_id, p.price]))

    return {
      id: raw.id,
      name: raw.name,
      is_active: raw.is_active,
      workspace_id: raw.workspace_id,
      created_at: raw.created_at,
      updated_at: raw.updated_at,
      categories: raw.menu_categories.map((mc) => ({
        id: mc.category.id,
        name: mc.category.name,
        order: mc.order,
        products: mc.category.product_categories.map((pc) => ({
          id: pc.product.id,
          name: pc.product.name,
          description: pc.product.description,
          base_price: pc.product.price,
          price: priceMap.get(pc.product.id) ?? pc.product.price,
          type: pc.product.type,
          is_available: pc.product.is_available,
          content: pc.product.content,
          image_url: pc.product.image_url,
        })),
      })),
    }
  }

  async findByWorkspaceId(workspaceId: number): Promise<Menu[]> {
    return this.prisma.menu.findMany({ where: { workspace_id: workspaceId } })
  }

  async findActiveByWorkspaceId(workspaceId: number): Promise<Menu[]> {
    return this.prisma.menu.findMany({ where: { workspace_id: workspaceId, is_active: true } })
  }

  async create(input: CreateMenuInput): Promise<Menu> {
    return this.prisma.menu.create({ data: input })
  }

  async update(id: number, input: UpdateMenuInput): Promise<Menu> {
    return this.prisma.menu.update({ where: { id }, data: input })
  }

  async delete(id: number): Promise<void> {
    await this.prisma.menu.delete({ where: { id } })
  }

  async assignCategory(menuId: number, categoryId: number, order = 0): Promise<void> {
    await this.prisma.menuCategory.upsert({
      where: { menu_id_category_id: { menu_id: menuId, category_id: categoryId } },
      create: { menu_id: menuId, category_id: categoryId, order },
      update: { order },
    })
  }

  async removeCategory(menuId: number, categoryId: number): Promise<void> {
    await this.prisma.menuCategory.delete({
      where: { menu_id_category_id: { menu_id: menuId, category_id: categoryId } },
    })
  }
}
