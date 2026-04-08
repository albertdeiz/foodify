import type { PrismaClient } from '@prisma/client'
import type { IProductRepository } from '../../../domain/repositories/product.repository'
import type {
  Product,
  ProductWithDetails,
  CreateProductInput,
  UpdateProductInput,
  ComboItem,
  CreateComboItemInput,
  UpdateComboItemInput,
} from '../../../domain/entities/product.entity'

const comboItemInclude = {
  product: true,
  complement_type: {
    include: { product_complements: { orderBy: { id: 'asc' as const } } },
  },
}

const withDetails = {
  product_product_complement_types: {
    include: {
      product_complement_type: {
        include: { product_complements: { orderBy: { id: 'asc' as const } } },
      },
    },
  },
  combo_items: {
    orderBy: { order: 'asc' as const },
    include: comboItemInclude,
  },
}

function mapDetails(raw: any): ProductWithDetails {
  const { product_product_complement_types, combo_items, ...base } = raw
  return {
    ...base,
    complement_types: product_product_complement_types.map((r: any) => r.product_complement_type),
    combo_items,
  }
}

export class PrismaProductRepository implements IProductRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByWorkspaceId(workspaceId: number): Promise<Product[]> {
    return this.prisma.product.findMany({
      where: { workspace_id: workspaceId },
      orderBy: { created_at: 'asc' },
    }) as Promise<Product[]>
  }

  async findById(id: number): Promise<Product | null> {
    return this.prisma.product.findUnique({ where: { id } }) as Promise<Product | null>
  }

  async findByIdWithDetails(id: number): Promise<ProductWithDetails | null> {
    const raw = await this.prisma.product.findUnique({ where: { id }, include: withDetails })
    if (!raw) return null
    return mapDetails(raw)
  }

  async findByCategoryId(categoryId: number): Promise<Product[]> {
    const records = await this.prisma.productCategory.findMany({
      where: { category_id: categoryId },
      include: { product: true },
      orderBy: { order: 'asc' },
    })
    return records.map((r) => r.product) as Product[]
  }

  async create(input: CreateProductInput): Promise<Product> {
    return this.prisma.product.create({ data: input }) as Promise<Product>
  }

  async update(id: number, input: UpdateProductInput): Promise<Product> {
    return this.prisma.product.update({ where: { id }, data: input }) as Promise<Product>
  }

  async delete(id: number): Promise<void> {
    await this.prisma.product.delete({ where: { id } })
  }

  async assignToCategory(productId: number, categoryId: number, order = 0): Promise<void> {
    await this.prisma.productCategory.upsert({
      where: { product_id_category_id: { product_id: productId, category_id: categoryId } },
      create: { product_id: productId, category_id: categoryId, order },
      update: { order },
    })
  }

  async removeFromCategory(productId: number, categoryId: number): Promise<void> {
    await this.prisma.productCategory.delete({
      where: { product_id_category_id: { product_id: productId, category_id: categoryId } },
    })
  }

  async assignComplementType(productId: number, complementTypeId: number): Promise<void> {
    await this.prisma.productProductComplementType.upsert({
      where: {
        product_id_product_complement_type_id: {
          product_id: productId,
          product_complement_type_id: complementTypeId,
        },
      },
      create: { product_id: productId, product_complement_type_id: complementTypeId },
      update: {},
    })
  }

  async removeComplementType(productId: number, complementTypeId: number): Promise<void> {
    await this.prisma.productProductComplementType.delete({
      where: {
        product_id_product_complement_type_id: {
          product_id: productId,
          product_complement_type_id: complementTypeId,
        },
      },
    })
  }

  async findComboItems(comboProductId: number): Promise<ComboItem[]> {
    return this.prisma.comboItem.findMany({
      where: { combo_product_id: comboProductId },
      orderBy: { order: 'asc' },
      include: comboItemInclude,
    }) as unknown as ComboItem[]
  }

  async addComboItem(comboProductId: number, input: CreateComboItemInput): Promise<ComboItem> {
    return this.prisma.comboItem.create({
      data: {
        combo_product_id: comboProductId,
        product_id: input.product_id ?? null,
        complement_type_id: input.complement_type_id ?? null,
        order: input.order ?? 0,
      },
      include: comboItemInclude,
    }) as unknown as ComboItem
  }

  async updateComboItem(itemId: number, input: UpdateComboItemInput): Promise<ComboItem> {
    return this.prisma.comboItem.update({
      where: { id: itemId },
      data: input,
      include: comboItemInclude,
    }) as unknown as ComboItem
  }

  async deleteComboItem(itemId: number): Promise<void> {
    await this.prisma.comboItem.delete({ where: { id: itemId } })
  }
}
