# Foodify Web

Frontend de Foodify: panel de administración y carta pública interactiva para el cliente final.

## Stack

| Capa | Tecnología |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite 5 |
| Routing | React Router DOM v6 |
| Data fetching | TanStack Query v5 (React Query) |
| HTTP | Axios |
| Formularios | React Hook Form + Zod |
| UI | Radix UI + shadcn-style components |
| Estilos | Tailwind CSS + CVA |
| Notificaciones | Sonner |
| Iconos | Lucide React |

## Estructura

```
src/
├── app/
│   ├── layouts/
│   │   ├── app.layout.tsx        # Guard de autenticación
│   │   ├── workspace.layout.tsx  # Sidebar de navegación del workspace
│   │   └── guest.layout.tsx      # Páginas de login/register
│   ├── providers.tsx             # React Query, Router, Toaster
│   └── router.tsx                # Definición de rutas
│
├── features/                     # Módulos por dominio (admin)
│   ├── auth/
│   ├── workspaces/
│   ├── menus/
│   ├── categories/
│   ├── products/
│   └── complement-types/
│
├── customer/                     # Sub-app pública (cliente final)
│   ├── api/
│   ├── context/
│   ├── hooks/
│   ├── layouts/
│   ├── pages/
│   └── components/
│
└── shared/
    ├── components/
    │   ├── ui/                   # Componentes Radix/shadcn
    │   └── form/                 # Wrappers React Hook Form
    ├── hooks/
    └── lib/
        ├── api-client.ts         # Axios con interceptor JWT
        ├── query-client.ts       # Config TanStack Query
        └── utils.ts              # cn(), clsx, tailwind-merge
```

## Convenciones por módulo (`features/*`)

Cada feature sigue la misma estructura:

```
features/ejemplo/
├── api/ejemplo.api.ts        # Llamadas HTTP (retornan el dato directamente)
├── hooks/use-ejemplo.ts      # useQuery / useMutation con query keys tipadas
├── pages/ejemplo.page.tsx    # Página principal del feature
├── components/               # Componentes específicos del feature
└── types.ts                  # Interfaces y tipos del dominio
```

### Patrón de query keys

```ts
export const ejemploKeys = {
  all: (workspaceId: number) => ['workspaces', workspaceId, 'ejemplo'] as const,
  detail: (workspaceId: number, id: number) => [...all(workspaceId), id] as const,
}
```

### Patrón de mutación

```ts
export function useCreateEjemplo(workspaceId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateInput) => ejemploApi.create(workspaceId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ejemploKeys.all(workspaceId) }),
  })
}
```

---

## Panel de administración

### Rutas

| Ruta | Página |
|---|---|
| `/` | Redirige a `/workspaces` |
| `/login` | Login |
| `/register` | Registro |
| `/workspaces` | Lista de restaurantes del usuario |
| `/workspaces/:id/menus` | Gestión de cartas |
| `/workspaces/:id/menus/:menuId` | Vista de carta (preview con categorías y productos) |
| `/workspaces/:id/categories` | Gestión de categorías |
| `/workspaces/:id/products` | Gestión de productos |
| `/workspaces/:id/complement-types` | Gestión de tipos de complemento |

### Autenticación

- Token JWT almacenado en `localStorage`
- `AuthContext` distribuye `user`, `token`, `isAuthenticated`
- `AppLayout` redirige a `/login` si no hay sesión
- `apiClient` inyecta el token automáticamente en cada request

### Features del panel

#### Cartas (`/menus`)
- CRUD de cartas con activación por switch
- Asignación de categorías: abre dialog, carga las categorías ya asignadas desde la API y permite toggle con feedback inmediato
- Vista previa (`/menus/:menuId`): categorías ordenadas, productos con precio especial de carta vs. precio base, clic en producto abre dialog de detalle completo

#### Productos (`/products`)
- Lista con switch de disponibilidad inline
- Dialog con tabs: **Información** (nombre, descripción, precio, tipo, contenido, imagen, disponibilidad) · **Complementos** (asignar/desasignar tipos de complemento) · **Combo** (gestión de slots fijos y flexibles) · **Categorías** (asignar/desasignar)
- Precios en euros en la UI, se multiplica/divide por 100 al comunicar con la API

#### Tipos de complemento (`/complement-types`)
- Lista con badge de número de opciones
- Dialog con tabs: **Información** (nombre, requerido, min/máx seleccionable) · **Opciones** (CRUD de complementos con precio, incremento y toggle de desactivación en tiempo real)

---

## Sub-app de cliente

Accesible sin autenticación. URL base: `/menu/:slug`

### Rutas

| Ruta | Descripción |
|---|---|
| `/menu/:slug` | Lista de cartas activas del restaurante. Si solo hay una, redirige directo |
| `/menu/:slug/:menuId` | Carta completa con carrito |
| `/menu/:slug/:menuId/checkout` | Resumen del pedido y confirmación |

### Arquitectura de la sub-app

```
customer/
├── api/
│   ├── public-client.ts          # Axios sin interceptor JWT
│   └── public.api.ts             # getRestaurant, getMenu, getProductDetail
├── context/
│   └── cart.context.tsx          # CartProvider + useCart + helpers de precio
├── hooks/
│   └── use-public.ts             # useRestaurant, usePublicMenu, usePublicProductDetail
├── layouts/
│   └── customer.layout.tsx       # Envuelve con CartProvider
├── pages/
│   ├── restaurant.page.tsx       # Selector de carta
│   ├── menu.page.tsx             # Carta con carrito
│   └── checkout.page.tsx         # Resumen y confirmación
└── components/
    ├── product-sheet.tsx          # Dialog de personalización
    └── cart-drawer.tsx            # Drawer lateral del carrito
```

### Estado del carrito

El carrito se gestiona con `useReducer` y se persiste en `localStorage` (clave: `foodify_cart_v1`).

```ts
interface CartItem {
  uid: string             // ID único de la entrada (permite mismo producto con distintas opciones)
  productId: number
  productName: string
  productImage: string | null
  productType: 'REGULAR' | 'COMPLEMENTED' | 'COMBO'
  menuPrice: number       // precio efectivo en esta carta (céntimos)
  complements: CartComplement[]
  comboSlots: CartComboSlot[]
  quantity: number
}
```

Al cambiar de carta se limpia el carrito automáticamente.

### Cálculo de precios

```ts
// Precio unitario = precio de carta + ajustes de complementos con increment=true
computeUnitPrice(item) → number

// Precio total del ítem
computeItemTotal(item) → unitPrice × quantity

// Total del carrito
computeCartTotal(items) → sum of computeItemTotal
```

Los precios se actualizan en tiempo real mientras el usuario selecciona opciones en el `ProductSheet`.

### ProductSheet — personalización de producto

- **REGULAR**: solo control de cantidad + botón añadir
- **COMPLEMENTED**: por cada `ComplementType`:
  - `max_selectable === 1` → comportamiento radio (única elección)
  - `max_selectable > 1` → comportamiento checkbox (hasta N opciones)
  - Indicador visual de requerido / listo
- **COMBO**: por cada `ComboItem` muestra el producto incluido; si ese producto tiene complementos propios, el cliente puede personalizarlos
- Botón "Añadir" deshabilitado hasta satisfacer todos los campos requeridos
- Precio total reactivo visible en el botón

### CartDrawer

- Desliza desde la derecha
- Lista de ítems con resumen de personalizaciones
- Control de cantidad inline (decremento a 0 = eliminar)
- Total y botón hacia checkout

---

## Setup

```bash
pnpm install
pnpm dev    # http://localhost:5173
```

El proxy de Vite redirige `/api/*` → `http://localhost:3000` (configurado en `vite.config.ts`).

### Variables de entorno

No se requieren variables de entorno. La URL de la API se resuelve via proxy de Vite en desarrollo.

---

## Componentes compartidos (`shared/`)

### `shared/components/ui/`

Componentes estilo shadcn sobre primitivos Radix UI: `Button`, `Badge`, `Card`, `Dialog`, `Form`, `Input`, `Select`, `Switch`, `Tabs`, `Checkbox`, `Avatar`, `Dropdown`, `Separator`, `Textarea`, `Label`.

Todos usan CVA para variantes y `cn()` para clases condicionales.

### `shared/components/form/`

Wrappers tipados sobre React Hook Form + shadcn:

| Componente | Descripción |
|---|---|
| `FormInput` | Input con label, description, error. Soporta `type="number"` con `valueAsNumber` |
| `FormTextarea` | Textarea con label y error |
| `FormSelect` | Select con opciones `{value, label}[]` |
| `FormSwitch` | Switch con label y description |

Uso:
```tsx
<FormInput control={form.control} name="price" label="Precio (€)" type="number" />
<FormSwitch control={form.control} name="is_active" label="Activo" />
```
