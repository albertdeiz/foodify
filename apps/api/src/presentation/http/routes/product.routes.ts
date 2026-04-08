import type { FastifyInstance } from 'fastify'
import { CreateProductUseCase } from '../../../application/use-cases/product/create-product.use-case'
import { GetProductsUseCase } from '../../../application/use-cases/product/get-products.use-case'
import { PrismaProductRepository } from '../../../infrastructure/database/repositories/prisma-product.repository'
import {
  createProductSchema,
  updateProductSchema,
  createComboItemSchema,
  updateComboItemSchema,
} from '../schemas/product.schema'
import { authMiddleware } from '../middleware/auth.middleware'

export async function productRoutes(app: FastifyInstance) {
  const repository = new PrismaProductRepository(app.prisma)

  // ── Listado y detalle ────────────────────────────────────────────────────

  app.get('/', { preHandler: authMiddleware }, async (request) => {
    const { workspaceId } = request.params as { workspaceId: string }
    return new GetProductsUseCase(repository).execute(Number(workspaceId))
  })

  app.get('/:id', { preHandler: authMiddleware }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const product = await repository.findByIdWithDetails(Number(id))
    if (!product) return reply.status(404).send({ error: 'Product not found' })
    return product
  })

  // ── CRUD ─────────────────────────────────────────────────────────────────

  app.post('/', { preHandler: authMiddleware }, async (request, reply) => {
    const { workspaceId } = request.params as { workspaceId: string }
    const body = createProductSchema.parse(request.body)
    const product = await new CreateProductUseCase(repository).execute({
      ...body,
      workspace_id: Number(workspaceId),
    })
    return reply.status(201).send(product)
  })

  app.patch('/:id', { preHandler: authMiddleware }, async (request) => {
    const { id } = request.params as { id: string }
    const body = updateProductSchema.parse(request.body)
    return repository.update(Number(id), body)
  })

  app.delete('/:id', { preHandler: authMiddleware }, async (request, reply) => {
    const { id } = request.params as { id: string }
    await repository.delete(Number(id))
    return reply.status(204).send()
  })

  // ── Categorías ───────────────────────────────────────────────────────────

  app.post('/:id/categories/:categoryId', { preHandler: authMiddleware }, async (request, reply) => {
    const { id, categoryId } = request.params as { id: string; categoryId: string }
    await repository.assignToCategory(Number(id), Number(categoryId))
    return reply.status(204).send()
  })

  app.delete('/:id/categories/:categoryId', { preHandler: authMiddleware }, async (request, reply) => {
    const { id, categoryId } = request.params as { id: string; categoryId: string }
    await repository.removeFromCategory(Number(id), Number(categoryId))
    return reply.status(204).send()
  })

  // ── Tipos de complemento ─────────────────────────────────────────────────

  app.post('/:id/complement-types/:typeId', { preHandler: authMiddleware }, async (request, reply) => {
    const { id, typeId } = request.params as { id: string; typeId: string }
    await repository.assignComplementType(Number(id), Number(typeId))
    return reply.status(204).send()
  })

  app.delete('/:id/complement-types/:typeId', { preHandler: authMiddleware }, async (request, reply) => {
    const { id, typeId } = request.params as { id: string; typeId: string }
    await repository.removeComplementType(Number(id), Number(typeId))
    return reply.status(204).send()
  })

  // ── ComboItems ───────────────────────────────────────────────────────────
  // Slot fijo:     { product_id: X }          → ese producto siempre incluido
  // Slot flexible: { complement_type_id: Y }  → el cliente elige de una lista;
  //                                             cada opción tiene linked_product_id
  //                                             para heredar los complementos del producto elegido

  app.get('/:id/combo-items', { preHandler: authMiddleware }, async (request) => {
    const { id } = request.params as { id: string }
    return repository.findComboItems(Number(id))
  })

  app.post('/:id/combo-items', { preHandler: authMiddleware }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const body = createComboItemSchema.parse(request.body)
    const item = await repository.addComboItem(Number(id), body)
    return reply.status(201).send(item)
  })

  app.patch('/:id/combo-items/:itemId', { preHandler: authMiddleware }, async (request) => {
    const { itemId } = request.params as { itemId: string }
    const body = updateComboItemSchema.parse(request.body)
    return repository.updateComboItem(Number(itemId), body)
  })

  app.delete('/:id/combo-items/:itemId', { preHandler: authMiddleware }, async (request, reply) => {
    const { itemId } = request.params as { itemId: string }
    await repository.deleteComboItem(Number(itemId))
    return reply.status(204).send()
  })
}
