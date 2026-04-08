import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import { prismaPlugin } from './infrastructure/plugins/prisma.plugin'
import { authRoutes } from './presentation/http/routes/auth.routes'
import { workspaceRoutes } from './presentation/http/routes/workspace.routes'
import { menuRoutes } from './presentation/http/routes/menu.routes'
import { categoryRoutes } from './presentation/http/routes/category.routes'
import { productRoutes } from './presentation/http/routes/product.routes'
import { complementTypeRoutes } from './presentation/http/routes/complement-type.routes'
import { publicRoutes } from './presentation/http/routes/public.routes'

const app = Fastify({ logger: true })

app.register(cors, { origin: true })
app.register(jwt, { secret: process.env.JWT_SECRET ?? 'dev-secret' })
app.register(prismaPlugin)

app.get('/health', async () => ({ status: 'ok' }))

app.register(authRoutes, { prefix: '/auth' })
app.register(workspaceRoutes, { prefix: '/workspaces' })
app.register(menuRoutes, { prefix: '/workspaces/:workspaceId/menus' })
app.register(categoryRoutes, { prefix: '/workspaces/:workspaceId/categories' })
app.register(productRoutes, { prefix: '/workspaces/:workspaceId/products' })
app.register(complementTypeRoutes, { prefix: '/workspaces/:workspaceId/complement-types' })
app.register(publicRoutes, { prefix: '/public' })

export default app
