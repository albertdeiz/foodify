import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Check } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Switch } from '@/shared/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog'
import { Form } from '@/shared/components/ui/form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { FormInput, FormTextarea, FormSelect, FormSwitch } from '@/shared/components/form'
import { useProducts, useCreateProduct, useToggleProductAvailability, useProductDetail, useComboItems, useAddComboItem, useDeleteComboItem } from '../hooks/use-products'
import { productsApi } from '../api/products.api'
import { useCategories } from '@/features/categories/hooks/use-categories'
import { useComplementTypes } from '@/features/complement-types/hooks/use-complement-types'
import { useQueryClient } from '@tanstack/react-query'
import { productKeys } from '../hooks/use-products'
import type { Product } from '../types'

const schema = z.object({
  name: z.string().min(1, 'Requerido'),
  description: z.string().min(1, 'Requerido'),
  price: z.number({ invalid_type_error: 'Número requerido' }).positive('Debe ser mayor a 0'),
  type: z.enum(['REGULAR', 'COMPLEMENTED', 'COMBO']),
  content: z.string().optional(),
  imageUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  isAvailable: z.boolean(),
})

type FormValues = z.infer<typeof schema>

const PRODUCT_TYPES = [
  { value: 'REGULAR', label: 'Regular — producto simple sin personalización' },
  { value: 'COMPLEMENTED', label: 'Con complementos — permite elegir extras/variantes' },
  { value: 'COMBO', label: 'Combo — agrupa otros productos' },
]

const TYPE_BADGE: Record<string, 'default' | 'secondary' | 'outline'> = {
  REGULAR: 'outline',
  COMPLEMENTED: 'secondary',
  COMBO: 'default',
}

function formatPrice(cents: number) {
  return (cents / 100).toFixed(2)
}

// ─── Complement Types Section ─────────────────────────────────────────────────
function ComplementTypesSection({ workspaceId, productId }: { workspaceId: number; productId: number }) {
  const qc = useQueryClient()
  const { data: detail } = useProductDetail(workspaceId, productId)
  const { data: allTypes } = useComplementTypes(workspaceId)

  const assignedIds = new Set(detail?.complementTypes.map((t) => t.id) ?? [])

  async function toggle(typeId: number) {
    if (assignedIds.has(typeId)) {
      await productsApi.removeComplementType(workspaceId, productId, typeId)
        .catch((e) => toast.error(e.message))
    } else {
      await productsApi.assignComplementType(workspaceId, productId, typeId)
        .catch((e) => toast.error(e.message))
    }
    qc.invalidateQueries({ queryKey: productKeys.detail(workspaceId, productId) })
  }

  if (!allTypes?.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay tipos de complemento en este workspace. Créalos primero.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {allTypes.map((type) => {
        const assigned = assignedIds.has(type.id)
        return (
          <button
            key={type.id}
            type="button"
            onClick={() => toggle(type.id)}
            className="flex items-center justify-between rounded-md border px-3 py-2 text-left transition-colors hover:bg-accent"
          >
            <div>
              <p className="text-sm font-medium">{type.name}</p>
              <p className="text-xs text-muted-foreground">
                {type.required ? 'Requerido' : 'Opcional'} · Máx. {type.maxSelectable} · {type.productComplements.length} opciones
              </p>
            </div>
            {assigned && <Check className="h-4 w-4 text-primary" />}
          </button>
        )
      })}
    </div>
  )
}

// ─── Combo Items Section ──────────────────────────────────────────────────────
function ComboItemsSection({ workspaceId, productId }: { workspaceId: number; productId: number }) {
  const { data: comboItems, isLoading } = useComboItems(workspaceId, productId)
  const { data: allProducts } = useProducts(workspaceId)
  const addComboItem = useAddComboItem(workspaceId, productId)
  const deleteComboItem = useDeleteComboItem(workspaceId, productId)
  const [addOpen, setAddOpen] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState('')
  const [order, setOrder] = useState('0')

  const otherProducts = allProducts?.filter((p) => p.id !== productId) ?? []

  async function handleAdd() {
    await addComboItem.mutateAsync({ productId: Number(selectedProductId), order: Number(order) })
      .then(() => {
        toast.success('Slot añadido')
        setAddOpen(false)
        setSelectedProductId('')
        setOrder(String((comboItems?.length ?? 0) + 1))
      })
      .catch((e) => toast.error(e.message))
  }

  async function handleDelete(itemId: number) {
    await deleteComboItem.mutateAsync(itemId).catch((e) => toast.error(e.message))
  }

  return (
    <div className="flex flex-col gap-3">
      {isLoading && <p className="text-sm text-muted-foreground">Cargando...</p>}

      {!isLoading && comboItems?.length === 0 && (
        <p className="text-sm text-muted-foreground">Este combo no tiene slots aún.</p>
      )}

      {comboItems?.map((item) => (
        <div key={item.id} className="flex items-center gap-3 rounded-md border px-3 py-2">
          <span className="text-xs text-muted-foreground w-6 shrink-0">#{item.order}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {item.product ? `Fijo: ${item.product.name}` : `Producto #${item.productId}`}
            </p>
            <p className="text-xs text-muted-foreground">Slot fijo</p>
          </div>
          <Button
            variant="ghost" size="icon" className="text-destructive shrink-0"
            onClick={() => handleDelete(item.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}

      {!addOpen ? (
        <Button variant="outline" size="sm" onClick={() => { setAddOpen(true); setOrder(String(comboItems?.length ?? 0)) }} className="self-start">
          <Plus className="h-3.5 w-3.5 mr-1" /> Añadir slot
        </Button>
      ) : (
        <div className="rounded-md border p-3 flex flex-col gap-3 bg-muted/30">
          <p className="text-sm font-medium">Nuevo slot del combo</p>
          <div className="grid grid-cols-2 gap-2">
            <select
              className="flex h-9 w-full rounded-md border bg-background px-3 py-1 text-sm"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
            >
              <option value="">— Selecciona producto —</option>
              {otherProducts.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <input
              type="number"
              className="flex h-9 w-full rounded-md border bg-background px-3 py-1 text-sm"
              placeholder="Orden"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={addComboItem.isPending || !selectedProductId}
            >
              Añadir
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setAddOpen(false)}>Cancelar</Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Category Assignment Section ──────────────────────────────────────────────
function CategorySection({ workspaceId, productId }: { workspaceId: number; productId: number }) {
  const [assignedIds, setAssignedIds] = useState<Set<number>>(new Set())
  const { data: categories } = useCategories(workspaceId)

  async function toggle(categoryId: number) {
    const next = new Set(assignedIds)
    if (next.has(categoryId)) {
      await productsApi.removeFromCategory(workspaceId, productId, categoryId)
        .catch((e) => toast.error(e.message))
      next.delete(categoryId)
    } else {
      await productsApi.assignToCategory(workspaceId, productId, categoryId)
        .catch((e) => toast.error(e.message))
      next.add(categoryId)
    }
    setAssignedIds(next)
  }

  if (!categories?.length) {
    return <p className="text-sm text-muted-foreground">No hay categorías. Créalas en la sección Categorías.</p>
  }

  return (
    <div className="flex flex-col gap-2">
      {categories.map((cat) => (
        <button
          key={cat.id}
          type="button"
          onClick={() => toggle(cat.id)}
          className="flex items-center justify-between rounded-md border px-3 py-2 text-left hover:bg-accent transition-colors"
        >
          <span className="text-sm">{cat.name}</span>
          {assignedIds.has(cat.id) && <Check className="h-4 w-4 text-primary" />}
        </button>
      ))}
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export function ProductsPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>()
  const wid = Number(workspaceId)
  const qc = useQueryClient()

  const { data: products, isLoading } = useProducts(wid)
  const createProduct = useCreateProduct(wid)
  const toggleAvailability = useToggleProductAvailability(wid)

  const [formOpen, setFormOpen] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [detailProductId, setDetailProductId] = useState<number | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '', price: 0, type: 'REGULAR', content: '', imageUrl: '', isAvailable: true },
  })

  const watchedType = form.watch('type')

  function openCreate() {
    setEditProduct(null)
    setDetailProductId(null)
    form.reset({ name: '', description: '', price: 0, type: 'REGULAR', content: '', imageUrl: '', isAvailable: true })
    setFormOpen(true)
  }

  function openEdit(product: Product) {
    setEditProduct(product)
    setDetailProductId(product.id)
    form.reset({
      name: product.name,
      description: product.description,
      price: product.price / 100,
      type: product.type,
      content: product.content ?? '',
      imageUrl: product.imageUrl ?? '',
      isAvailable: product.isAvailable,
    })
    setFormOpen(true)
  }

  async function onSubmit(values: FormValues) {
    const payload = {
      ...values,
      price: Math.round(values.price * 100),
      content: values.content || undefined,
      imageUrl: values.imageUrl || undefined,
    }

    if (editProduct) {
      await productsApi.update(wid, editProduct.id, payload)
        .then(() => { toast.success('Producto actualizado'); qc.invalidateQueries({ queryKey: productKeys.all(wid) }) })
        .catch((e) => toast.error(e.message))
      // Keep dialog open to manage complement types / combo items
    } else {
      await createProduct.mutateAsync(payload)
        .then((p) => {
          toast.success('Producto creado')
          setEditProduct(p)
          setDetailProductId(p.id)
          // Stay open to configure complement types or combo items
        })
        .catch((e) => toast.error(e.message))
    }
  }

  async function handleDelete(id: number) {
    await productsApi.delete(wid, id)
      .then(() => { toast.success('Producto eliminado'); qc.invalidateQueries({ queryKey: productKeys.all(wid) }) })
      .catch((e) => toast.error(e.message))
  }

  const showComplementTab = watchedType === 'COMPLEMENTED' || watchedType === 'COMBO'
  const showComboTab = watchedType === 'COMBO'

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Productos</h2>
          <p className="text-sm text-muted-foreground">Biblioteca de productos del restaurante</p>
        </div>
        <Button onClick={openCreate} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Nuevo producto
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Cargando...</p>
      ) : products?.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="mb-3">Aún no hay productos.</p>
          <Button variant="outline" onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> Crear producto</Button>
        </div>
      ) : (
        <div className="flex flex-col divide-y border rounded-lg overflow-hidden">
          {products?.map((product) => (
            <div key={product.id} className="flex items-center gap-4 px-4 py-3 bg-background">
              <Switch
                checked={product.isAvailable}
                onCheckedChange={() => toggleAvailability.mutate({ id: product.id, isAvailable: !product.isAvailable })}
                aria-label="Disponible"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{product.name}</p>
                <p className="text-xs text-muted-foreground truncate">{product.description}</p>
              </div>
              <Badge variant={TYPE_BADGE[product.type] ?? 'outline'} className="shrink-0 text-xs">
                {product.type}
              </Badge>
              <span className="text-sm font-medium shrink-0">{formatPrice(product.price)} €</span>
              <Button variant="ghost" size="icon" onClick={() => openEdit(product)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(product.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Product Dialog */}
      <Dialog open={formOpen} onOpenChange={(o) => { if (!o) { setFormOpen(false); setEditProduct(null); setDetailProductId(null) } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editProduct ? `Editar: ${editProduct.name}` : 'Nuevo producto'}</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="info">
            <TabsList className="w-full">
              <TabsTrigger value="info" className="flex-1">Información</TabsTrigger>
              {showComplementTab && (
                <TabsTrigger value="complements" className="flex-1">
                  Complementos
                </TabsTrigger>
              )}
              {showComboTab && (
                <TabsTrigger value="combo" className="flex-1">
                  Productos del combo
                </TabsTrigger>
              )}
              {detailProductId && (
                <TabsTrigger value="categories" className="flex-1">Categorías</TabsTrigger>
              )}
            </TabsList>

            {/* ── Tab: Info ─────────────────────────────────────────── */}
            <TabsContent value="info" className="mt-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                  <FormInput control={form.control} name="name" label="Nombre" placeholder="Ej: Big Burger" />
                  <FormTextarea control={form.control} name="description" label="Descripción" placeholder="Describe el producto..." />

                  <div className="grid grid-cols-2 gap-3">
                    <FormInput
                      control={form.control}
                      name="price"
                      label="Precio (€)"
                      type="number"
                      placeholder="9.90"
                      description="El precio se almacena en céntimos"
                    />
                    <FormSelect
                      control={form.control}
                      name="type"
                      label="Tipo"
                      options={PRODUCT_TYPES}
                    />
                  </div>

                  {/* Type description */}
                  {watchedType === 'COMPLEMENTED' && (
                    <p className="text-xs text-muted-foreground bg-muted rounded-md px-3 py-2">
                      Los productos con complementos permiten al cliente personalizar su pedido eligiendo entre las opciones definidas en cada tipo de complemento.
                    </p>
                  )}
                  {watchedType === 'COMBO' && (
                    <p className="text-xs text-muted-foreground bg-muted rounded-md px-3 py-2">
                      Un combo agrupa otros productos. Los productos hijos se gestionan en la pestaña "Productos del combo". Cada hijo puede ser REGULAR o COMPLEMENTED.
                    </p>
                  )}

                  <FormInput control={form.control} name="content" label="Contenido (opcional)" placeholder="Ej: 280g, 8 unidades, 500ml" />
                  <FormInput control={form.control} name="imageUrl" label="URL de imagen (opcional)" type="url" placeholder="https://..." />
                  <FormSwitch
                    control={form.control}
                    name="isAvailable"
                    label="Disponible"
                    description="El producto aparece visible en la carta"
                  />

                  <Button type="submit" disabled={createProduct.isPending}>
                    {editProduct ? 'Guardar cambios' : 'Crear producto'}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            {/* ── Tab: Complementos ─────────────────────────────────── */}
            {showComplementTab && (
              <TabsContent value="complements" className="mt-4">
                {detailProductId ? (
                  <>
                    <p className="text-sm text-muted-foreground mb-3">
                      Selecciona los tipos de complemento disponibles para este producto. Los tipos de complemento se crean a nivel de workspace y se reutilizan entre productos.
                    </p>
                    <ComplementTypesSection workspaceId={wid} productId={detailProductId} />
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Guarda el producto primero para configurar los complementos.</p>
                )}
              </TabsContent>
            )}

            {/* ── Tab: Combo ────────────────────────────────────────── */}
            {showComboTab && (
              <TabsContent value="combo" className="mt-4">
                {detailProductId ? (
                  <>
                    <p className="text-sm text-muted-foreground mb-3">
                      Añade slots fijos al combo. Cada slot incluye un producto específico que el cliente puede personalizar si tiene complementos.
                    </p>
                    <ComboItemsSection workspaceId={wid} productId={detailProductId} />
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Guarda el producto primero para configurar los slots del combo.</p>
                )}
              </TabsContent>
            )}

            {/* ── Tab: Categorías ───────────────────────────────────── */}
            {detailProductId && (
              <TabsContent value="categories" className="mt-4">
                <p className="text-sm text-muted-foreground mb-3">
                  Asigna este producto a una o varias categorías del workspace.
                </p>
                <CategorySection workspaceId={wid} productId={detailProductId} />
              </TabsContent>
            )}
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  )
}
