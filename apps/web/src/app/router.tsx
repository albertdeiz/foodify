import { Routes, Route, Navigate } from 'react-router-dom'
import { GuestLayout } from './layouts/guest.layout'
import { AppLayout } from './layouts/app.layout'
import { WorkspaceLayout } from './layouts/workspace.layout'
import { LoginPage } from '@/features/auth/pages/login.page'
import { RegisterPage } from '@/features/auth/pages/register.page'
import { WorkspacesPage } from '@/features/workspaces/pages/workspaces.page'
import { MenusPage } from '@/features/menus/pages/menus.page'
import { MenuDetailPage } from '@/features/menus/pages/menu-detail.page'
import { CategoriesPage } from '@/features/categories/pages/categories.page'
import { ProductsPage } from '@/features/products/pages/products.page'
import { ComplementTypesPage } from '@/features/complement-types/pages/complement-types.page'
import { CustomerLayout } from '@/customer/layouts/customer.layout'
import { RestaurantPage } from '@/customer/pages/restaurant.page'
import { MenuPage } from '@/customer/pages/menu.page'
import { CheckoutPage } from '@/customer/pages/checkout.page'

const NotFound = () => (
  <div className="flex h-screen items-center justify-center text-muted-foreground">
    404 — Página no encontrada
  </div>
)

export function Router() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/workspaces" replace />} />

      <Route element={<GuestLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<AppLayout />}>
        <Route path="/workspaces" element={<WorkspacesPage />} />
        <Route path="/workspaces/:workspaceId" element={<WorkspaceLayout />}>
          <Route index element={<Navigate to="menus" replace />} />
          <Route path="menus" element={<MenusPage />} />
          <Route path="menus/:menuId" element={<MenuDetailPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="complement-types" element={<ComplementTypesPage />} />
        </Route>
      </Route>

      <Route element={<CustomerLayout />}>
        <Route path="/menu/:slug" element={<RestaurantPage />} />
        <Route path="/menu/:slug/:menuId" element={<MenuPage />} />
        <Route path="/menu/:slug/:menuId/checkout" element={<CheckoutPage />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
