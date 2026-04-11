import type { FastifyInstance } from 'fastify'
import { GetPublicWorkspaceUseCase } from '../../../application/use-cases/public/get-public-workspace.use-case'
import { GetPublicMenuUseCase } from '../../../application/use-cases/public/get-public-menu.use-case'
import { GetPublicProductUseCase } from '../../../application/use-cases/public/get-public-product.use-case'
import { PrismaWorkspaceRepository } from '../../../infrastructure/database/repositories/prisma-workspace.repository'
import { PrismaMenuRepository } from '../../../infrastructure/database/repositories/prisma-menu.repository'
import { PrismaProductRepository } from '../../../infrastructure/database/repositories/prisma-product.repository'

export async function publicRoutes(app: FastifyInstance) {
  const workspaceRepository = new PrismaWorkspaceRepository(app.prisma)
  const menuRepository = new PrismaMenuRepository(app.prisma)
  const productRepository = new PrismaProductRepository(app.prisma)

  // GET /public/:slug → info del restaurante + cartas activas
  app.get('/:slug', async (request, reply) => {
    const { slug } = request.params as { slug: string }
    const workspace = await new GetPublicWorkspaceUseCase(workspaceRepository).execute(slug)
    if (!workspace) return reply.status(404).send({ error: 'Restaurante no encontrado' })
    return workspace
  })

  // GET /public/:slug/menus/:menuId → carta con categorías y productos básicos
  app.get('/:slug/menus/:menuId', async (request, reply) => {
    const { slug, menuId } = request.params as { slug: string; menuId: string }
    const menu = await new GetPublicMenuUseCase(workspaceRepository, menuRepository).execute(slug, Number(menuId))
    if (!menu) return reply.status(404).send({ error: 'Carta no encontrada' })
    return menu
  })

  // GET /public/:slug/products/:productId → detalle completo del producto para el carrito
  app.get('/:slug/products/:productId', async (request, reply) => {
    const { slug, productId } = request.params as { slug: string; productId: string }
    const product = await new GetPublicProductUseCase(workspaceRepository, productRepository).execute(slug, Number(productId))
    if (!product) return reply.status(404).send({ error: 'Producto no encontrado' })
    return product
  })
}
