# Foodify API

Backend del sistema de administración de cartas digitales para restaurantes.

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Fastify 4 + TypeScript |
| ORM | Prisma 5 |
| Base de datos | SQLite (dev) |
| Validación | Zod |
| Auth | JWT (`@fastify/jwt`) |
| Hashing | bcryptjs |

## Arquitectura

Clean Architecture en 4 capas:

```
src/
├── domain/             # Entidades e interfaces de repositorio (sin dependencias externas)
│   ├── entities/
│   └── repositories/
├── application/        # Casos de uso (orquestan dominio, no conocen HTTP ni Prisma)
│   └── use-cases/
├── infrastructure/     # Implementaciones concretas (Prisma, plugins)
│   └── database/repositories/
└── presentation/       # HTTP: rutas, schemas de validación, middleware
    └── http/
```

## Modelo de datos

### User
Cuenta de usuario. Puede gestionar uno o varios restaurantes.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | Int PK | — |
| `first_name` | String | — |
| `last_name` | String | — |
| `email` | String unique | Identificador de login |
| `password` | String | Hash bcrypt |

### Workspace (Restaurante)
Un restaurante. Un usuario puede ser miembro de varios.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | Int PK | — |
| `name` | String | Nombre visible |
| `slug` | String unique | Identificador para URL pública (`/burgerpizza-co`) |
| `address` | String | Dirección física |

### UserWorkspace
Unión N:M entre usuarios y restaurantes. Preparada para soportar roles futuros (owner, staff…).

### Category
Agrupa productos. Una misma categoría puede estar en varias cartas y un producto en varias categorías.

| Campo | Tipo | Descripción |
|---|---|---|
| `order` | Int | Orden por defecto dentro del restaurante |

### Menu (Carta)
Una carta es una selección ordenada de categorías. Un restaurante puede tener varias cartas activas. El QR de mesa apunta al listado de cartas activas.

| Campo | Tipo | Descripción |
|---|---|---|
| `is_active` | Boolean | Visibilidad pública sin borrar la carta |

Al eliminar un menú se eliminan en cascada sus `MenuCategory` y `MenuProductPrice`.

### MenuCategory
Qué categorías aparecen en qué carta y en qué orden. La misma categoría puede tener órdenes distintos en cartas distintas.

### Product
Unidad del catálogo. Existen tres tipos:

| Tipo | Descripción |
|---|---|
| `REGULAR` | Sin personalización (Agua, Café…) |
| `COMPLEMENTED` | Con opciones de personalización (Hamburguesa, Pizza…) |
| `COMBO` | Compuesto por otros productos mediante slots (Combo Big Burger…) |

| Campo | Tipo | Descripción |
|---|---|---|
| `price` | Int | Precio base en **céntimos** (`899` = 8.99 €) |
| `type` | String | `REGULAR \| COMPLEMENTED \| COMBO` |
| `content` | String? | Información de cantidad visible al cliente ("280g", "6 uds") |
| `is_available` | Boolean | Ocultar por stock o temporada sin borrar |

### MenuProductPrice
Precio especial de un producto en una carta concreta. Si no existe registro se usa el precio base. Permite que la Big Burger cueste 8.99 € en la carta principal y 7.49 € en el Menú del Día sin duplicar el producto.

### ComboItem
Cada registro es un slot (componente) de un producto COMBO.

| Campo | Tipo | Descripción |
|---|---|---|
| `order` | Int | Orden de presentación del slot |
| `product_id` | Int? | Producto del catálogo incluido en este slot |

Cada slot apunta a un producto real del catálogo. El cliente puede personalizarlo con los propios complementos de ese producto.

**Ejemplo — Combo Nuggets:**
```
ComboItem 0: product_id → Nuggets (9 uds)
ComboItem 1: product_id → Patatas Fritas
ComboItem 2: product_id → Refresco
```

### ProductComplementType
Grupo de opciones de personalización definido a nivel de restaurante. Se reutiliza entre productos: "Salsas" se asigna a hamburguesas, pizzas y acompañamientos sin duplicar configuración.

| Campo | Tipo | Descripción |
|---|---|---|
| `required` | Boolean | El cliente debe elegir al menos una opción |
| `min_selectable` | Int | Mínimo de selecciones requeridas |
| `max_selectable` | Int | Máximo de selecciones simultáneas (1 = elección única) |

### ProductProductComplementType
Qué tipos de complemento están activos en cada producto. Eliminar este registro desactiva la opción para ese producto sin borrar el tipo ni sus opciones del restaurante.

### ProductComplement
Una opción concreta dentro de un tipo de complemento.

| Campo | Tipo | Descripción |
|---|---|---|
| `price` | Int | Ajuste en céntimos. Positivo (+150), negativo (-50) o cero |
| `increment` | Boolean | `true` si el precio se suma al total |
| `is_disabled` | Boolean | Oculta la opción sin borrarla (stock, temporada…) |
| `linked_product_id` | Int? | Si esta opción representa un producto real del catálogo, apunta a él. Permite heredar sus complementos para personalización adicional |

---

## Endpoints

Base URL: `http://localhost:3000`

### Auth (sin autenticación)

```
POST /auth/register     Registro de usuario
POST /auth/login        Login → devuelve token JWT
```

---

### Endpoints autenticados

Todos requieren header:
```
Authorization: Bearer <token>
```

### Workspaces

```
GET    /workspaces/         Listar restaurantes del usuario autenticado
POST   /workspaces/         Crear restaurante
PATCH  /workspaces/:id      Actualizar restaurante
```

### Menús

```
GET    /workspaces/:wid/menus/                              Listar cartas
POST   /workspaces/:wid/menus/                              Crear carta
GET    /workspaces/:wid/menus/:id                           Carta con categorías y productos completos
PATCH  /workspaces/:wid/menus/:id                           Actualizar carta
DELETE /workspaces/:wid/menus/:id                           Eliminar carta (cascada: MenuCategory, MenuProductPrice)

POST   /workspaces/:wid/menus/:id/categories/:catId         Añadir categoría a la carta
DELETE /workspaces/:wid/menus/:id/categories/:catId         Quitar categoría de la carta

PUT    /workspaces/:wid/menus/:id/products/:productId/price     Establecer precio especial
DELETE /workspaces/:wid/menus/:id/products/:productId/price     Eliminar precio especial (vuelve al base)
```

**Respuesta de `GET /workspaces/:wid/menus/:id`:**
```json
{
  "id": 1,
  "name": "Carta Principal",
  "is_active": true,
  "categories": [
    {
      "id": 3,
      "name": "Hamburguesas",
      "order": 0,
      "products": [
        {
          "id": 7,
          "name": "Big Burger",
          "price": 799,
          "base_price": 899,
          "type": "COMPLEMENTED",
          "content": "280g",
          "image_url": null
        }
      ]
    }
  ]
}
```
`price` es el precio efectivo en esa carta (especial si existe, si no el base). `base_price` es siempre el precio del catálogo.

### Categorías

```
GET    /workspaces/:wid/categories/        Listar categorías
POST   /workspaces/:wid/categories/        Crear categoría
PATCH  /workspaces/:wid/categories/:id     Actualizar
DELETE /workspaces/:wid/categories/:id     Eliminar
```

### Productos

```
GET    /workspaces/:wid/products/          Listar todos los productos del restaurante
POST   /workspaces/:wid/products/          Crear producto
GET    /workspaces/:wid/products/:id       Detalle con complement_types y combo_items
PATCH  /workspaces/:wid/products/:id       Actualizar
DELETE /workspaces/:wid/products/:id       Eliminar

POST   /workspaces/:wid/products/:id/categories/:catId         Asignar a categoría
DELETE /workspaces/:wid/products/:id/categories/:catId         Desasignar de categoría

POST   /workspaces/:wid/products/:id/complement-types/:typeId  Asignar tipo de complemento
DELETE /workspaces/:wid/products/:id/complement-types/:typeId  Desasignar tipo de complemento

GET    /workspaces/:wid/products/:id/combo-items               Listar slots del combo
POST   /workspaces/:wid/products/:id/combo-items               Añadir slot
PATCH  /workspaces/:wid/products/:id/combo-items/:itemId       Actualizar slot (orden)
DELETE /workspaces/:wid/products/:id/combo-items/:itemId       Eliminar slot
```

**Body — crear/actualizar producto:**
```json
{
  "name": "Big Burger",
  "description": "Hamburguesa clásica con lechuga, tomate y salsa especial",
  "price": 899,
  "type": "COMPLEMENTED",
  "content": "280g",
  "image_url": "https://...",
  "is_available": true
}
```

**Body — añadir slot a combo:**
```json
{ "product_id": 3, "order": 0 }
```

### Tipos de complemento

```
GET    /workspaces/:wid/complement-types/                               Listar (incluye sus opciones)
POST   /workspaces/:wid/complement-types/                               Crear tipo
PATCH  /workspaces/:wid/complement-types/:id                            Actualizar tipo
DELETE /workspaces/:wid/complement-types/:id                            Eliminar tipo

POST   /workspaces/:wid/complement-types/:id/complements                Añadir opción
PATCH  /workspaces/:wid/complement-types/:id/complements/:complementId  Actualizar opción
DELETE /workspaces/:wid/complement-types/:id/complements/:complementId  Eliminar opción
```

**Body — crear tipo de complemento:**
```json
{
  "name": "Tipo de carne",
  "required": true,
  "min_selectable": 1,
  "max_selectable": 1
}
```

**Body — añadir opción:**
```json
{ "name": "Bacon extra", "price": 100, "increment": true }
{ "name": "Sin lechuga", "price": 0, "increment": false }
{ "name": "Tamaño pequeño", "price": -50, "increment": true }
{ "name": "Big Burger", "price": 0, "increment": false, "linked_product_id": 1 }
```

---

### Endpoints públicos (sin autenticación)

Diseñados para la app del cliente final. Usan el `slug` del restaurante como identificador.

```
GET /public/:slug                          Info del restaurante + cartas activas
GET /public/:slug/menus/:menuId            Carta con categorías y productos (precio efectivo)
GET /public/:slug/products/:productId      Detalle del producto con complement_types y combo_items
```

**Respuesta de `GET /public/:slug`:**
```json
{
  "id": 1,
  "name": "BurgerPizza Co.",
  "slug": "burgerpizza-co",
  "address": "Calle Falsa 123",
  "menus": [
    { "id": 1, "name": "Carta Principal" },
    { "id": 2, "name": "Menú del Día" }
  ]
}
```

Solo devuelve cartas con `is_active: true`. Solo devuelve productos con `is_available: true`. Las opciones de complemento con `is_disabled: true` se excluyen.

---

## Setup

```bash
pnpm install
cp .env.example .env       # DATABASE_URL=file:./prisma/dev.db JWT_SECRET=...

pnpm db:migrate            # aplica migraciones
pnpm db:seed               # datos de ejemplo (BurgerPizza Co.)
pnpm dev                   # servidor en http://localhost:3000
```

### Variables de entorno

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Path SQLite: `file:./prisma/dev.db` |
| `JWT_SECRET` | Clave para firmar tokens JWT |

### Datos de seed

```
Usuario:     admin@foodify.com / password123
Restaurante: BurgerPizza Co.
Slug:        burgerpizza-co
```

Incluye 56 productos, 10 categorías, 8 tipos de complemento, 4 cartas y combos con slots flexibles y fijos.

URL pública de ejemplo: `http://localhost:5173/menu/burgerpizza-co`

### Scripts disponibles

| Script | Descripción |
|---|---|
| `pnpm dev` | Servidor en modo desarrollo con hot-reload |
| `pnpm build` | Compilar TypeScript a `dist/` |
| `pnpm db:migrate` | Crear y aplicar migraciones Prisma |
| `pnpm db:seed` | Poblar la base de datos con datos de ejemplo |
| `pnpm db:studio` | Abrir Prisma Studio (GUI de la base de datos) |

---

## Decisiones de diseño

### Precios en céntimos
Todos los precios se almacenan como enteros en céntimos (`899` = 8.99 €) para evitar errores de coma flotante. El frontend divide entre 100 para mostrar y multiplica al enviar.

### ComboItem en vez de parent_product_id
Los combos usan una tabla `ComboItem` que referencia productos reales del catálogo. Esto permite:
- Reutilizar el mismo producto (Big Burger) en varios combos
- Heredar los complementos del producto incluido para personalización adicional
- Un cambio en el producto base se refleja en todos los combos que lo usan

### ProductComplementType a nivel de restaurante
Los tipos de complemento viven en el restaurante, no en el producto. "Salsas" se define una vez y se asigna a hamburguesas, acompañamientos y pizzas. Un cambio (añadir una nueva salsa) se refleja en todos los productos que lo tienen asignado.

### Cascade delete en menús
`MenuCategory` y `MenuProductPrice` tienen `onDelete: Cascade` en su relación con `Menu`. Al eliminar una carta se limpian automáticamente sus asignaciones de categorías y precios especiales, evitando violaciones de clave foránea.

### Separación de endpoints admin / público
Los endpoints de administración requieren JWT. Los endpoints públicos (`/public/*`) no requieren autenticación y filtran automáticamente solo contenido activo/disponible, protegiendo la lógica de negocio interna.
