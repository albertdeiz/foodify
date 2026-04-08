import type { FastifyInstance } from 'fastify'
import { CreateMenuUseCase } from '../../../application/use-cases/menu/create-menu.use-case'
import { GetMenusUseCase } from '../../../application/use-cases/menu/get-menus.use-case'
import { PrismaMenuRepository } from '../../../infrastructure/database/repositories/prisma-menu.repository'
import { createMenuSchema, updateMenuSchema } from '../schemas/menu.schema'
import { authMiddleware } from '../middleware/auth.middleware'
import { z } from 'zod'

const priceSchema = z.object({ price: z.number().int().min(0) })

export async function menuRoutes(app: FastifyInstance) {
  const repository = new PrismaMenuRepository(app.prisma)

  // ── CRUD ─────────────────────────────────────────────────────────────────

  app.get('/', { preHandler: authMiddleware }, async (request) => {
    const { workspaceId } = request.params as { workspaceId: string }
    return new GetMenusUseCase(repository).execute(Number(workspaceId))
  })

  app.get('/:id', { preHandler: authMiddleware }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const menu = await repository.findByIdWithContent(Number(id))
    if (!menu) return reply.status(404).send({ error: 'Menu not found' })
    return menu
  })

  app.post('/', { preHandler: authMiddleware }, async (request, reply) => {
    const { workspaceId } = request.params as { workspaceId: string }
    const body = createMenuSchema.parse(request.body)
    const menu = await new CreateMenuUseCase(repository).execute({
      ...body,
      workspace_id: Number(workspaceId),
    })
    return reply.status(201).send(menu)
  })

  app.patch('/:id', { preHandler: authMiddleware }, async (request) => {
    const { id } = request.params as { id: string }
    const body = updateMenuSchema.parse(request.body)
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
    await repository.assignCategory(Number(id), Number(categoryId))
    return reply.status(204).send()
  })

  app.delete('/:id/categories/:categoryId', { preHandler: authMiddleware }, async (request, reply) => {
    const { id, categoryId } = request.params as { id: string; categoryId: string }
    await repository.removeCategory(Number(id), Number(categoryId))
    return reply.status(204).send()
  })

  // ── Precio especial por producto en esta carta ────────────────────────────
  // PUT  /:id/products/:productId/price   → crea o reemplaza el precio especial
  // DELETE /:id/products/:productId/price → elimina el precio especial (vuelve al precio base)

  app.put('/:id/products/:productId/price', { preHandler: authMiddleware }, async (request, reply) => {
    const { id, productId } = request.params as { id: string; productId: string }
    const { price } = priceSchema.parse(request.body)
    await app.prisma.menuProductPrice.upsert({
      where: { menu_id_product_id: { menu_id: Number(id), product_id: Number(productId) } },
      create: { menu_id: Number(id), product_id: Number(productId), price },
      update: { price },
    })
    return reply.status(204).send()
  })

  app.delete('/:id/products/:productId/price', { preHandler: authMiddleware }, async (request, reply) => {
    const { id, productId } = request.params as { id: string; productId: string }
    await app.prisma.menuProductPrice.delete({
      where: { menu_id_product_id: { menu_id: Number(id), product_id: Number(productId) } },
    })
    return reply.status(204).send()
  })
}
