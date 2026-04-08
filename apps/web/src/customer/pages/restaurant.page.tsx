import { useParams, useNavigate } from 'react-router-dom'
import { MapPin, UtensilsCrossed } from 'lucide-react'
import { useRestaurant } from '../hooks/use-public'

export function RestaurantPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { data: workspace, isLoading, error } = useRestaurant(slug!)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground text-sm">Cargando...</p>
      </div>
    )
  }

  if (error || !workspace) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground text-sm">Restaurante no encontrado.</p>
      </div>
    )
  }

  // Single active menu → go straight to it
  if (workspace.menus.length === 1) {
    navigate(`/menu/${slug}/${workspace.menus[0].id}`, { replace: true })
    return null
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-3">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <UtensilsCrossed className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-2xl font-bold">{workspace.name}</h1>
        {workspace.address && (
          <p className="text-sm text-muted-foreground mt-1 flex items-center justify-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {workspace.address}
          </p>
        )}
      </div>

      {/* Menu list */}
      {workspace.menus.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground">No hay cartas disponibles ahora mismo.</p>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Elige una carta
          </p>
          {workspace.menus.map((menu) => (
            <button
              key={menu.id}
              onClick={() => navigate(`/menu/${slug}/${menu.id}`)}
              className="flex items-center justify-between rounded-xl border px-5 py-4 text-left hover:bg-muted/40 transition-colors"
            >
              <span className="font-medium">{menu.name}</span>
              <span className="text-muted-foreground text-lg">›</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
