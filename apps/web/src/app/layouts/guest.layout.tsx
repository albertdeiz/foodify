import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/features/auth/context/auth.context'

export function GuestLayout() {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to="/workspaces" replace />
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40">
      <Outlet />
    </div>
  )
}
