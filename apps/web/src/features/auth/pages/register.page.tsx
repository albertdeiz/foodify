import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Form } from '@/shared/components/ui/form'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { FormInput } from '@/shared/components/form'
import { useRegister } from '../hooks/use-auth'

const schema = z.object({
  firstName: z.string().min(1, 'Requerido'),
  lastName: z.string().min(1, 'Requerido'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
})

type FormValues = z.infer<typeof schema>

export function RegisterPage() {
  const register = useRegister()
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { firstName: '', lastName: '', email: '', password: '' },
  })

  async function onSubmit(values: FormValues) {
    await register.mutateAsync(values).catch((e) => {
      toast.error(e.message)
    })
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Crear cuenta</CardTitle>
        <CardDescription>Empieza a gestionar tus restaurantes</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <FormInput control={form.control} name="firstName" label="Nombre" placeholder="Juan" />
              <FormInput control={form.control} name="lastName" label="Apellido" placeholder="García" />
            </div>
            <FormInput control={form.control} name="email" label="Email" type="email" placeholder="tu@email.com" />
            <FormInput control={form.control} name="password" label="Contraseña" type="password" placeholder="••••••••" />
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={register.isPending}>
              {register.isPending ? 'Creando cuenta...' : 'Crear cuenta'}
            </Button>
            <p className="text-sm text-muted-foreground">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="underline hover:text-foreground">
                Inicia sesión
              </Link>
            </p>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
