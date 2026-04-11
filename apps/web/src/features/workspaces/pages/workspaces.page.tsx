import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, MapPin, ExternalLink } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog'
import { Form } from '@/shared/components/ui/form'
import { FormInput, FormSelect } from '@/shared/components/form'
import { CURRENCIES, DEFAULT_CURRENCY } from '@/shared/lib/currency'
import { useWorkspaces, useCreateWorkspace } from '../hooks/use-workspaces'

const schema = z.object({
  name: z.string().min(1, 'Requerido'),
  slug: z.string().min(1, 'Requerido').regex(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones'),
  address: z.string().min(1, 'Requerido'),
  currency: z.string().min(1, 'Requerido'),
})

type FormValues = z.infer<typeof schema>

function toSlug(value: string) {
  return value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export function WorkspacesPage() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { data: workspaces, isLoading } = useWorkspaces()
  const createWorkspace = useCreateWorkspace()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', slug: '', address: '', currency: DEFAULT_CURRENCY },
  })

  const nameValue = form.watch('name')
  useEffect(() => {
    if (!form.formState.dirtyFields.slug) {
      form.setValue('slug', toSlug(nameValue ?? ''))
    }
  }, [nameValue, form])

  async function onSubmit(values: FormValues) {
    await createWorkspace
      .mutateAsync(values)
      .then((workspace) => {
        toast.success('Restaurante creado')
        setOpen(false)
        form.reset()
        navigate(`/workspaces/${workspace.id}/menus`)
      })
      .catch((e) => toast.error(e.message))
  }

  return (
    <div className="container max-w-4xl py-8 px-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Mis restaurantes</h1>
          <p className="text-muted-foreground text-sm mt-1">Gestiona tus establecimientos</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo restaurante
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuevo restaurante</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-2">
                <FormInput
                  control={form.control}
                  name="name"
                  label="Nombre"
                  placeholder="Mi Restaurante"
                />
                <FormInput
                  control={form.control}
                  name="slug"
                  label="Slug (URL)"
                  placeholder="mi-restaurante"
                  description="Identificador único para el QR. Solo minúsculas y guiones."
                />
                <FormInput control={form.control} name="address" label="Dirección" placeholder="Calle Mayor 1" />
                <FormSelect
                  control={form.control}
                  name="currency"
                  label="Moneda"
                  options={CURRENCIES}
                />
                <Button type="submit" disabled={createWorkspace.isPending}>
                  {createWorkspace.isPending ? 'Creando...' : 'Crear restaurante'}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground text-sm">Cargando...</div>
      ) : workspaces?.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="mb-4">Aún no tienes restaurantes.</p>
          <Button onClick={() => setOpen(true)} variant="outline">
            <Plus className="h-4 w-4 mr-2" /> Crear tu primero
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {workspaces?.map((workspace) => (
            <Card
              key={workspace.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/workspaces/${workspace.id}/menus`)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{workspace.name}</CardTitle>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </div>
                <CardDescription className="flex items-center gap-1 text-xs">
                  <MapPin className="h-3 w-3" />
                  {workspace.address}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-mono">/{workspace.slug}</span>
                <span className="text-xs text-muted-foreground">{workspace.currency}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
