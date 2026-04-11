import type { FastifyInstance } from 'fastify'

export async function publicRoutes(app: FastifyInstance) {
  // GET /public/:slug → info del restaurante + cartas activas
  app.get('/:slug', async (request, reply) => {
    const { slug } = request.params as { slug: string }
    const workspace = await app.prisma.workspace.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        address: true,
        currency: true,
        menus: {
          where: { is_active: true },
          select: { id: true, name: true },
        },
      },
    })
    if (!workspace) return reply.status(404).send({ error: 'Restaurante no encontrado' })
    return workspace
  })

  // GET /public/:slug/menus/:menuId → carta con categorías y productos básicos
  app.get('/:slug/menus/:menuId', async (request, reply) => {
    const { slug, menuId } = request.params as { slug: string; menuId: string }
    const workspace = await app.prisma.workspace.findUnique({
      where: { slug },
      select: { id: true },
    })
    if (!workspace) return reply.status(404).send({ error: 'Restaurante no encontrado' })

    const menu = await app.prisma.menu.findFirst({
      where: { id: Number(menuId), workspace_id: workspace.id, is_active: true },
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
    if (!menu) return reply.status(404).send({ error: 'Carta no encontrada' })

    const priceMap = new Map(menu.menu_product_prices.map((p) => [p.product_id, p.price]))

    return {
      id: menu.id,
      name: menu.name,
      categories: menu.menu_categories.map((mc) => ({
        id: mc.category.id,
        name: mc.category.name,
        order: mc.order,
        products: mc.category.product_categories
          .filter((pc) => pc.product.is_available)
          .map((pc) => ({
            id: pc.product.id,
            name: pc.product.name,
            description: pc.product.description,
            base_price: pc.product.price,
            price: priceMap.get(pc.product.id) ?? pc.product.price,
            type: pc.product.type,
            content: pc.product.content,
            image_url: pc.product.image_url,
          })),
      })),
    }
  })

  // GET /public/:slug/products/:productId → detalle completo del producto para el carrito
  app.get('/:slug/products/:productId', async (request, reply) => {
    const { slug, productId } = request.params as { slug: string; productId: string }
    const workspace = await app.prisma.workspace.findUnique({
      where: { slug },
      select: { id: true },
    })
    if (!workspace) return reply.status(404).send({ error: 'Restaurante no encontrado' })

    const product = await app.prisma.product.findFirst({
      where: { id: Number(productId), workspace_id: workspace.id },
      include: {
        product_product_complement_types: {
          include: {
            product_complement_type: {
              include: {
                product_complements: {
                  where: { is_disabled: false },
                  orderBy: { id: 'asc' },
                },
              },
            },
          },
        },
        combo_items: {
          orderBy: { order: 'asc' },
          include: {
            product: {
              include: {
                product_product_complement_types: {
                  include: {
                    product_complement_type: {
                      include: {
                        product_complements: {
                          where: { is_disabled: false },
                          orderBy: { id: 'asc' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    })
    if (!product) return reply.status(404).send({ error: 'Producto no encontrado' })

    const { product_product_complement_types, combo_items, ...base } = product
    return {
      ...base,
      complement_types: product_product_complement_types.map((r) => r.product_complement_type),
      combo_items: combo_items.map((ci) => ({
        id: ci.id,
        order: ci.order,
        product_id: ci.product_id,
        product: ci.product
          ? {
              id: ci.product.id,
              name: ci.product.name,
              description: ci.product.description,
              price: ci.product.price,
              complement_types: ci.product.product_product_complement_types.map(
                (r) => r.product_complement_type,
              ),
            }
          : null,
      })),
    }
  })
}
