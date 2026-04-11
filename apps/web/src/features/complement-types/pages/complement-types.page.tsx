import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, EyeOff, Eye } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog'
import { Form } from '@/shared/components/ui/form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { FormInput, FormSwitch } from '@/shared/components/form'
import { cn } from '@/shared/lib/utils'
import { formatPriceAdjust } from '@/shared/lib/format-price'
import { DEFAULT_CURRENCY } from '@/shared/lib/currency'
import { useWorkspace } from '@/features/workspaces/hooks/use-workspaces'
import {
  useComplementTypes,
  useCreateComplementType,
  useUpdateComplementType,
  useDeleteComplementType,
  useAddComplement,
  useUpdateComplement,
  useDeleteComplement,
} from '../hooks/use-complement-types'
import type { ComplementType, ProductComplement } from '../types'

// ─── Schemas ──────────────────────────────────────────────────────────────────
const typeSchema = z.object({
  name: z.string().min(1, 'Requerido'),
  required: z.boolean(),
  minSelectable: z.number({ invalid_type_error: 'Número requerido' }).int().min(0),
  maxSelectable: z.number({ invalid_type_error: 'Número requerido' }).int().min(1),
})
type TypeFormValues = z.infer<typeof typeSchema>

const complementSchema = z.object({
  name: z.string().min(1, 'Requerido'),
  price: z.number({ invalid_type_error: 'Número requerido' }),
  increment: z.boolean(),
})
type ComplementFormValues = z.infer<typeof complementSchema>

// ─── Options Section ───────────────────────────────────────────────────────────
function OptionsSection({
  workspaceId,
  typeId,
  options,
  currency,
}: {
  workspaceId: number
  typeId: number
  options: ProductComplement[]
  currency: string
}) {
  const addComplement = useAddComplement(workspaceId)
  const updateComplement = useUpdateComplement(workspaceId)
  const deleteComplement = useDeleteComplement(workspaceId)
  const [addOpen, setAddOpen] = useState(false)
  const [editComplement, setEditComplement] = useState<ProductComplement | null>(null)

  const form = useForm<ComplementFormValues>({
    resolver: zodResolver(complementSchema),
    defaultValues: { name: '', price: 0, increment: true },
  })

  function openAdd() {
    setEditComplement(null)
    form.reset({ name: '', price: 0, increment: true })
    setAddOpen(true)
  }

  function openEdit(c: ProductComplement) {
    setEditComplement(c)
    form.reset({ name: c.name, price: c.price / 100, increment: c.increment })
    setAddOpen(true)
  }

  async function onSubmit(values: ComplementFormValues) {
    const payload = { ...values, price: Math.round(values.price * 100) }
    if (editComplement) {
      await updateComplement
        .mutateAsync({ typeId, complementId: editComplement.id, ...payload })
        .then(() => { toast.success('Opción actualizada'); setAddOpen(false) })
        .catch((e) => toast.error(e.message))
    } else {
      await addComplement
        .mutateAsync({ typeId, ...payload })
        .then(() => { toast.success('Opción añadida'); form.reset({ name: '', price: 0, increment: true }) })
        .catch((e) => toast.error(e.message))
    }
  }

  async function handleDelete(complementId: number) {
    await deleteComplement.mutateAsync({ typeId, complementId }).catch((e) => toast.error(e.message))
  }

  async function toggleDisabled(c: ProductComplement) {
    await updateComplement
      .mutateAsync({ typeId, complementId: c.id, isDisabled: !c.isDisabled })
      .catch((e) => toast.error(e.message))
  }

  return (
    <div className="flex flex-col gap-2">
      {options.length === 0 && (
        <p className="text-sm text-muted-foreground">No hay opciones todavía.</p>
      )}

      {options.map((c) => (
        <div key={c.id} className="flex items-center gap-3 rounded-md border px-3 py-2">
          <div className="flex-1 min-w-0">
            <p className={cn('text-sm font-medium truncate', c.isDisabled && 'line-through text-muted-foreground')}>
              {c.name}
            </p>
            <p className="text-xs text-muted-foreground">{formatPriceAdjust(c.price, currency)}</p>
          </div>
          {c.isDisabled && (
            <Badge variant="secondary" className="text-xs shrink-0">Desactivada</Badge>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground shrink-0"
            title={c.isDisabled ? 'Activar' : 'Desactivar'}
            onClick={() => toggleDisabled(c)}
          >
            {c.isDisabled ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
          </Button>
          <Button variant="ghost" size="icon" className="shrink-0" onClick={() => openEdit(c)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive shrink-0"
            onClick={() => handleDelete(c.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}

      {!addOpen ? (
        <Button variant="outline" size="sm" onClick={openAdd} className="self-start mt-1">
          <Plus className="h-3.5 w-3.5 mr-1" /> Nueva opción
        </Button>
      ) : (
        <div className="rounded-md border p-3 flex flex-col gap-3 bg-muted/30 mt-1">
          <p className="text-sm font-medium">{editComplement ? 'Editar opción' : 'Nueva opción'}</p>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-3">
              <FormInput control={form.control} name="name" label="Nombre" placeholder="Ej: Bacon extra, Sin lechuga..." />
              <FormInput
                control={form.control}
                name="price"
                label="Ajuste de precio (€)"
                type="number"
                description="Positivo = +precio, negativo = −precio, 0 = gratis"
              />
              <FormSwitch
                control={form.control}
                name="increment"
                label="Suma al precio total"
                description="Desactivar si el ajuste es solo informativo"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  type="submit"
                  disabled={addComplement.isPending || updateComplement.isPending}
                >
                  {editComplement ? 'Guardar' : 'Añadir'}
                </Button>
                <Button size="sm" variant="ghost" type="button" onClick={() => setAddOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export function ComplementTypesPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>()
  const wid = Number(workspaceId)
  const { data: workspace } = useWorkspace(wid)
  const currency = workspace?.currency ?? DEFAULT_CURRENCY

  const { data: types, isLoading } = useComplementTypes(wid)
  const createType = useCreateComplementType(wid)
  const updateType = useUpdateComplementType(wid)
  const deleteType = useDeleteComplementType(wid)

  const [formOpen, setFormOpen] = useState(false)
  const [editTypeId, setEditTypeId] = useState<number | null>(null)

  // Always read from live query so options update after mutations
  const editType = types?.find((t) => t.id === editTypeId) ?? null

  const form = useForm<TypeFormValues>({
    resolver: zodResolver(typeSchema),
    defaultValues: { name: '', required: false, minSelectable: 0, maxSelectable: 1 },
  })

  function openCreate() {
    setEditTypeId(null)
    form.reset({ name: '', required: false, minSelectable: 0, maxSelectable: 1 })
    setFormOpen(true)
  }

  function openEdit(t: ComplementType) {
    setEditTypeId(t.id)
    form.reset({
      name: t.name,
      required: t.required,
      minSelectable: t.minSelectable,
      maxSelectable: t.maxSelectable,
    })
    setFormOpen(true)
  }

  async function onSubmit(values: TypeFormValues) {
    if (editType) {
      await updateType
        .mutateAsync({ id: editType.id, ...values })
        .then(() => toast.success('Tipo actualizado'))
        .catch((e) => toast.error(e.message))
    } else {
      await createType
        .mutateAsync(values)
        .then(() => toast.success('Tipo creado'))
        .catch((e) => toast.error(e.message))
    }
    setFormOpen(false)
  }

  async function handleDelete(id: number) {
    await deleteType.mutateAsync(id)
      .then(() => toast.success('Tipo eliminado'))
      .catch((e) => toast.error(e.message))
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Tipos de complemento</h2>
          <p className="text-sm text-muted-foreground">Grupos de opciones reutilizables entre productos</p>
        </div>
        <Button onClick={openCreate} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Nuevo tipo
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Cargando...</p>
      ) : types?.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="mb-3">Aún no hay tipos de complemento.</p>
          <Button variant="outline" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1" /> Crear tipo
          </Button>
        </div>
      ) : (
        <div className="flex flex-col divide-y border rounded-lg overflow-hidden">
          {types?.map((t) => (
            <div key={t.id} className="flex items-center gap-4 px-4 py-3 bg-background">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{t.name}</p>
                <p className="text-xs text-muted-foreground">
                  {t.required ? 'Requerido' : 'Opcional'} · min {t.minSelectable} / máx {t.maxSelectable}
                </p>
              </div>
              <Badge variant="outline" className="shrink-0 text-xs">
                {t.productComplements.length} opciones
              </Badge>
              <Button variant="ghost" size="icon" onClick={() => openEdit(t)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive"
                onClick={() => handleDelete(t.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={formOpen}
        onOpenChange={(o) => {
          if (!o) { setFormOpen(false); setEditTypeId(null) }
        }}
      >
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editType ? `Editar: ${editType.name}` : 'Nuevo tipo de complemento'}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="info">
            <TabsList className="w-full">
              <TabsTrigger value="info" className="flex-1">Información</TabsTrigger>
              {editType && (
                <TabsTrigger value="options" className="flex-1">
                  Opciones ({editType.productComplements.length})
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="info" className="mt-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                  <FormInput
                    control={form.control}
                    name="name"
                    label="Nombre"
                    placeholder="Ej: Tipo de carne, Salsas, Extras..."
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <FormInput
                      control={form.control}
                      name="minSelectable"
                      label="Mínimo seleccionable"
                      type="number"
                      description="0 = ninguno obligatorio"
                    />
                    <FormInput
                      control={form.control}
                      name="maxSelectable"
                      label="Máximo seleccionable"
                      type="number"
                      description="1 = elección única"
                    />
                  </div>
                  <FormSwitch
                    control={form.control}
                    name="required"
                    label="Requerido"
                    description="El cliente debe elegir al menos una opción"
                  />
                  <Button type="submit" disabled={createType.isPending || updateType.isPending}>
                    {editType ? 'Guardar cambios' : 'Crear tipo'}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            {editType && (
              <TabsContent value="options" className="mt-4">
                <p className="text-sm text-muted-foreground mb-3">
                  Gestiona las opciones de este grupo. El precio puede ser positivo (+), negativo (−) o cero.
                </p>
                <OptionsSection
                  workspaceId={wid}
                  typeId={editType.id}
                  options={editType.productComplements}
                  currency={currency}
                />
              </TabsContent>
            )}
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  )
}
