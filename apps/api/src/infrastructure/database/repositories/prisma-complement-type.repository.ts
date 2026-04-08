import type { PrismaClient } from '@prisma/client'
import type { IComplementTypeRepository } from '../../../domain/repositories/complement-type.repository'
import type {
  ComplementType,
  ProductComplement,
  CreateComplementTypeInput,
  UpdateComplementTypeInput,
  CreateComplementInput,
  UpdateComplementInput,
} from '../../../domain/entities/complement-type.entity'

const includeComplements = { product_complements: { orderBy: { id: 'asc' as const } } }

export class PrismaComplementTypeRepository implements IComplementTypeRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByWorkspaceId(workspaceId: number): Promise<ComplementType[]> {
    return this.prisma.productComplementType.findMany({
      where: { workspace_id: workspaceId },
      include: includeComplements,
      orderBy: { id: 'asc' },
    }) as unknown as ComplementType[]
  }

  async findById(id: number): Promise<ComplementType | null> {
    return this.prisma.productComplementType.findUnique({
      where: { id },
      include: includeComplements,
    }) as unknown as ComplementType | null
  }

  async create(input: CreateComplementTypeInput): Promise<ComplementType> {
    return this.prisma.productComplementType.create({
      data: input,
      include: includeComplements,
    }) as unknown as ComplementType
  }

  async update(id: number, input: UpdateComplementTypeInput): Promise<ComplementType> {
    return this.prisma.productComplementType.update({
      where: { id },
      data: input,
      include: includeComplements,
    }) as unknown as ComplementType
  }

  async delete(id: number): Promise<void> {
    await this.prisma.productComplementType.delete({ where: { id } })
  }

  async addComplement(typeId: number, input: CreateComplementInput): Promise<ProductComplement> {
    return this.prisma.productComplement.create({
      data: {
        product_complement_type_id: typeId,
        name: input.name,
        price: input.price,
        // increment: true cuando el precio suma al total (positivo).
        // Precios negativos (ej: tamaño pequeño) o cero no son incrementos.
        increment: input.price > 0,
        is_disabled: false,
        linked_product_id: input.linked_product_id ?? null,
      },
    }) as unknown as ProductComplement
  }

  async updateComplement(complementId: number, input: UpdateComplementInput): Promise<ProductComplement> {
    const data: Record<string, unknown> = { ...input }
    if (typeof input.price === 'number') data.increment = input.price > 0
    return this.prisma.productComplement.update({
      where: { id: complementId },
      data,
    }) as unknown as ProductComplement
  }

  async deleteComplement(complementId: number): Promise<void> {
    await this.prisma.productComplement.delete({ where: { id: complementId } })
  }
}
