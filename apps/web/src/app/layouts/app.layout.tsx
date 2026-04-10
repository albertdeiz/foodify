import { Navigate, Outlet, Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/context/auth.context'
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar'
import { Button } from '@/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'

export function AppLayout() {
  const { isAuthenticated, user, logout } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />

  const initials = user
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : '?'

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background h-14 flex items-center px-6 gap-4">
        <Link to="/workspaces" className="font-semibold text-lg tracking-tight">
          Foodify
        </Link>
        <div className="flex-1" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 h-9">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <span className="text-sm">{user?.firstName} {user?.lastName}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem disabled className="text-muted-foreground text-xs">
              {user?.email}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive">
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
