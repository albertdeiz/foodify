import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Tags, Eye } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog'
import { Form } from '@/shared/components/ui/form'
import { Switch } from '@/shared/components/ui/switch'
import { Separator } from '@/shared/components/ui/separator'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { FormInput, FormSwitch } from '@/shared/components/form'
import { useMenus, useCreateMenu } from '../hooks/use-menus'
import { menusApi } from '../api/menus.api'
import { useCategories } from '@/features/categories/hooks/use-categories'
import { useQueryClient } from '@tanstack/react-query'
import { menuKeys } from '../hooks/use-menus'
import type { Menu } from '../types'

const schema = z.object({
  name: z.string().min(1, 'Requerido'),
  is_active: z.boolean(),
})

type FormValues = z.infer<typeof schema>

export function MenusPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>()
  const wid = Number(workspaceId)
  const qc = useQueryClient()
  const navigate = useNavigate()

  const { data: menus, isLoading } = useMenus(wid)
  const { data: categories } = useCategories(wid)
  const createMenu = useCreateMenu(wid)

  const [formOpen, setFormOpen] = useState(false)
  const [editMenu, setEditMenu] = useState<Menu | null>(null)
  const [assignMenu, setAssignMenu] = useState<Menu | null>(null)
  const [assignedIds, setAssignedIds] = useState<Set<number>>(new Set())
  const [assignLoading, setAssignLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', is_active: true },
  })

  function openCreate() {
    setEditMenu(null)
    form.reset({ name: '', is_active: true })
    setFormOpen(true)
  }

  function openEdit(menu: Menu) {
    setEditMenu(menu)
    form.reset({ name: menu.name, is_active: menu.is_active })
    setFormOpen(true)
  }

  async function openAssign(menu: Menu) {
    setAssignMenu(menu)
    setAssignedIds(new Set())
    setAssignLoading(true)
    try {
      const content = await menusApi.getById(wid, menu.id)
      setAssignedIds(new Set(content.categories.map((c) => c.id)))
    } catch {
      // si falla, abrimos igualmente con estado vacío
    } finally {
      setAssignLoading(false)
    }
  }

  async function onSubmit(values: FormValues) {
    if (editMenu) {
      await menusApi.update(wid, editMenu.id, values)
        .then(() => { toast.success('Carta actualizada'); qc.invalidateQueries({ queryKey: menuKeys.all(wid) }) })
        .catch((e) => toast.error(e.message))
    } else {
      await createMenu.mutateAsync({ name: values.name })
        .then(() => toast.success('Carta creada'))
        .catch((e) => toast.error(e.message))
    }
    setFormOpen(false)
  }

  async function handleDelete(id: number) {
    await menusApi.delete(wid, id)
      .then(() => { toast.success('Carta eliminada'); qc.invalidateQueries({ queryKey: menuKeys.all(wid) }) })
      .catch((e) => toast.error(e.message))
  }

  async function handleToggleActive(menu: Menu) {
    await menusApi.update(wid, menu.id, { is_active: !menu.is_active })
      .then(() => qc.invalidateQueries({ queryKey: menuKeys.all(wid) }))
      .catch((e) => toast.error(e.message))
  }

  async function toggleCategoryAssignment(categoryId: number) {
    if (!assignMenu) return
    const next = new Set(assignedIds)
    try {
      if (next.has(categoryId)) {
        await menusApi.removeCategory(wid, assignMenu.id, categoryId)
        next.delete(categoryId)
      } else {
        await menusApi.assignCategory(wid, assignMenu.id, categoryId)
        next.add(categoryId)
      }
      setAssignedIds(next)
      qc.invalidateQueries({ queryKey: menuKeys.detail(wid, assignMenu.id) })
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Cartas</h2>
          <p className="text-sm text-muted-foreground">Gestiona las cartas de tu restaurante</p>
        </div>
        <Button onClick={openCreate} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Nueva carta
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Cargando...</p>
      ) : menus?.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="mb-3">Aún no hay cartas.</p>
          <Button variant="outline" onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> Crear carta</Button>
        </div>
      ) : (
        <div className="flex flex-col divide-y border rounded-lg overflow-hidden">
          {menus?.map((menu) => (
            <div key={menu.id} className="flex items-center gap-4 px-4 py-3 bg-background">
              <Switch
                checked={menu.is_active}
                onCheckedChange={() => handleToggleActive(menu)}
                aria-label="Activa"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{menu.name}</p>
              </div>
              <Badge variant={menu.is_active ? 'default' : 'secondary'}>
                {menu.is_active ? 'Activa' : 'Inactiva'}
              </Badge>
              <Button variant="ghost" size="icon" title="Ver carta" onClick={() => navigate(`/workspaces/${workspaceId}/menus/${menu.id}`)}>
                <Eye className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" title="Asignar categorías" onClick={() => openAssign(menu)}>
                <Tags className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" title="Editar" onClick={() => openEdit(menu)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-destructive" title="Eliminar" onClick={() => handleDelete(menu.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editMenu ? 'Editar carta' : 'Nueva carta'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-2">
              <FormInput control={form.control} name="name" label="Nombre" placeholder="Carta de verano" />
              {editMenu && <FormSwitch control={form.control} name="is_active" label="Carta activa" />}
              <Button type="submit" disabled={createMenu.isPending}>
                {editMenu ? 'Guardar cambios' : 'Crear carta'}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Assign categories dialog */}
      <Dialog open={!!assignMenu} onOpenChange={(o) => !o && setAssignMenu(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Categorías — {assignMenu?.name}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Selecciona las categorías visibles en esta carta.</p>
          <Separator />
          <div className="flex flex-col gap-3 max-h-72 overflow-y-auto">
            {assignLoading ? (
              <p className="text-sm text-muted-foreground">Cargando...</p>
            ) : categories?.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay categorías. Créalas en la sección Categorías.</p>
            ) : (
              categories?.map((cat) => (
                <label key={cat.id} className="flex items-center gap-3 cursor-pointer">
                  <Checkbox
                    checked={assignedIds.has(cat.id)}
                    onCheckedChange={() => toggleCategoryAssignment(cat.id)}
                  />
                  <span className="text-sm">{cat.name}</span>
                </label>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
