# Foodify

Plataforma de cartas digitales para restaurantes. Permite gestionar productos, categorías, complementos y cartas desde un panel de administración, y ofrece una vista pública interactiva con carrito para el cliente final.

## Estructura del monorepo

```
foodify/
├── apps/
│   ├── api/          # Backend — Fastify + Prisma + SQLite
│   └── web/          # Frontend — React + Vite
├── packages/         # Paquetes compartidos (futuro)
├── turbo.json
└── pnpm-workspace.yaml
```

## Stack global

| Capa | Tecnología |
|---|---|
| Monorepo | Turborepo + pnpm workspaces |
| Backend | Fastify 4 + TypeScript + Prisma 5 + SQLite |
| Frontend | React 18 + Vite + TanStack Query + Tailwind CSS |
| Validación | Zod (API y formularios) |
| Auth | JWT (`@fastify/jwt`) |

## Arranque rápido

```bash
pnpm install

# API
cd apps/api
cp .env.example .env          # DATABASE_URL + JWT_SECRET
pnpm db:migrate               # crea y aplica migraciones
pnpm db:seed                  # datos de ejemplo (BurgerPizza Co.)
pnpm dev                      # http://localhost:3000

# Web (en otra terminal)
cd apps/web
pnpm dev                      # http://localhost:5173
```

O desde la raíz con Turborepo:

```bash
pnpm dev   # arranca API y web en paralelo
```

## Aplicaciones

### Panel de administración — `/workspaces`

Gestión completa del restaurante:

- **Cartas** (`/workspaces/:id/menus`) — crear, activar/desactivar, asignar categorías, ver vista previa
- **Categorías** (`/workspaces/:id/categories`) — CRUD
- **Productos** (`/workspaces/:id/products`) — CRUD con tipos (Regular, Con complementos, Combo), asignación de categorías y tipos de complemento, gestión de slots de combo
- **Complementos** (`/workspaces/:id/complement-types`) — tipos de complemento reutilizables con sus opciones, validación de min/max seleccionables

### Carta pública para el cliente — `/menu/:slug`

Vista de cara al cliente, sin autenticación:

- `/menu/:slug` — restaurante y lista de cartas activas
- `/menu/:slug/:menuId` — carta con productos por categoría, carrito interactivo
- `/menu/:slug/:menuId/checkout` — resumen del pedido con precios reactivos

## Documentación detallada

- [`apps/api/README.md`](apps/api/README.md) — API: endpoints, modelo de datos, decisiones de diseño
- [`apps/web/README.md`](apps/web/README.md) — Frontend: arquitectura, rutas, estado, convenciones
