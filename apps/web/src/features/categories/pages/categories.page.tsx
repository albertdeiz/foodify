import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog'
import { Form } from '@/shared/components/ui/form'
import { FormInput } from '@/shared/components/form'
import { useCategories, useCreateCategory } from '../hooks/use-categories'
import { categoriesApi } from '../api/categories.api'
import { useQueryClient } from '@tanstack/react-query'
import { categoryKeys } from '../hooks/use-categories'
import type { Category } from '../types'

const schema = z.object({
  name: z.string().min(1, 'Requerido'),
})

type FormValues = z.infer<typeof schema>

export function CategoriesPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>()
  const wid = Number(workspaceId)
  const qc = useQueryClient()

  const { data: categories, isLoading } = useCategories(wid)
  const createCategory = useCreateCategory(wid)

  const [formOpen, setFormOpen] = useState(false)
  const [editCategory, setEditCategory] = useState<Category | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '' },
  })

  function openCreate() {
    setEditCategory(null)
    form.reset({ name: '' })
    setFormOpen(true)
  }

  function openEdit(category: Category) {
    setEditCategory(category)
    form.reset({ name: category.name })
    setFormOpen(true)
  }

  async function onSubmit(values: FormValues) {
    if (editCategory) {
      await categoriesApi.update(wid, editCategory.id, values)
        .then(() => { toast.success('Categoría actualizada'); qc.invalidateQueries({ queryKey: categoryKeys.all(wid) }) })
        .catch((e) => toast.error(e.message))
    } else {
      await createCategory.mutateAsync(values)
        .then(() => toast.success('Categoría creada'))
        .catch((e) => toast.error(e.message))
    }
    setFormOpen(false)
  }

  async function handleDelete(id: number) {
    await categoriesApi.delete(wid, id)
      .then(() => { toast.success('Categoría eliminada'); qc.invalidateQueries({ queryKey: categoryKeys.all(wid) }) })
      .catch((e) => toast.error(e.message))
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Categorías</h2>
          <p className="text-sm text-muted-foreground">Organiza tus productos por categorías</p>
        </div>
        <Button onClick={openCreate} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Nueva categoría
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Cargando...</p>
      ) : categories?.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="mb-3">Aún no hay categorías.</p>
          <Button variant="outline" onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> Crear categoría</Button>
        </div>
      ) : (
        <div className="flex flex-col divide-y border rounded-lg overflow-hidden">
          {categories?.map((cat) => (
            <div key={cat.id} className="flex items-center gap-4 px-4 py-3 bg-background">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{cat.name}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => openEdit(cat)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(cat.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editCategory ? 'Editar categoría' : 'Nueva categoría'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-2">
              <FormInput control={form.control} name="name" label="Nombre" placeholder="Entrantes, Postres..." />
              <Button type="submit" disabled={createCategory.isPending}>
                {editCategory ? 'Guardar cambios' : 'Crear categoría'}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
