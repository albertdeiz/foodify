import { NavLink, Outlet, useParams, Link } from 'react-router-dom'
import { useWorkspaces } from '@/features/workspaces/hooks/use-workspaces'
import { cn } from '@/shared/lib/utils'
import { ChevronLeft, UtensilsCrossed, LayoutList, Tag, SlidersHorizontal } from 'lucide-react'
import { Separator } from '@/shared/components/ui/separator'

const navItems = [
  { to: 'menus', label: 'Cartas', icon: LayoutList },
  { to: 'categories', label: 'Categorías', icon: Tag },
  { to: 'products', label: 'Productos', icon: UtensilsCrossed },
  { to: 'complement-types', label: 'Complementos', icon: SlidersHorizontal },
]

export function WorkspaceLayout() {
  const { workspaceId } = useParams<{ workspaceId: string }>()
  const { data: workspaces } = useWorkspaces()
  const workspace = workspaces?.find((w) => w.id === Number(workspaceId))

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <aside className="w-56 border-r flex flex-col bg-muted/20">
        <div className="p-4">
          <Link
            to="/workspaces"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ChevronLeft className="h-4 w-4" />
            Restaurantes
          </Link>
          <p className="font-medium text-sm truncate">{workspace?.name ?? '...'}</p>
          <p className="text-xs text-muted-foreground truncate">{workspace?.address}</p>
        </div>
        <Separator />
        <nav className="p-2 flex flex-col gap-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={`/workspaces/${workspaceId}/${to}`}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  )
}
