import { Outlet } from 'react-router-dom'
import { CartProvider } from '../context/cart.context'

export function CustomerLayout() {
  return (
    <CartProvider>
      <div className="min-h-screen bg-background">
        <Outlet />
      </div>
    </CartProvider>
  )
}
