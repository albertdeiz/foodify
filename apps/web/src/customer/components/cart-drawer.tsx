import { useNavigate, useParams } from 'react-router-dom'
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Separator } from '@/shared/components/ui/separator'
import { cn } from '@/shared/lib/utils'
import { useCart, computeUnitPrice, computeItemTotal, computeCartTotal } from '../context/cart.context'
import type { CartItem } from '../types'

function fmt(cents: number) {
  return (cents / 100).toFixed(2) + ' €'
}

// ─── Single cart item ─────────────────────────────────────────────────────────

function CartItemRow({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem } = useCart()
  const unitPrice = computeUnitPrice(item)

  const complementLines = item.complements
    .filter((c) => c.selectedOptions.length > 0)
    .map((c) => `${c.typeName}: ${c.selectedOptions.map((o) => o.name).join(', ')}`)

  const comboLines = item.comboSlots
    .filter((s) => s.selectedOption || s.fixedProduct)
    .map((s) =>
      s.fixedProduct
        ? s.fixedProduct.name
        : s.selectedOption
        ? `${s.complementTypeName}: ${s.selectedOption.name}`
        : ''
    )
    .filter(Boolean)

  return (
    <div className="flex flex-col gap-2 py-3">
      <div className="flex items-start gap-3">
        {/* Quantity controls */}
        <div className="flex items-center gap-1 border rounded-md shrink-0">
          <button
            className="h-7 w-7 flex items-center justify-center text-muted-foreground hover:text-foreground"
            onClick={() => updateQuantity(item.uid, item.quantity - 1)}
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="w-5 text-center text-sm font-semibold tabular-nums">{item.quantity}</span>
          <button
            className="h-7 w-7 flex items-center justify-center text-muted-foreground hover:text-foreground"
            onClick={() => updateQuantity(item.uid, item.quantity + 1)}
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>

        {/* Name + customizations */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-snug">{item.productName}</p>
          {[...complementLines, ...comboLines].map((line, i) => (
            <p key={i} className="text-xs text-muted-foreground truncate">{line}</p>
          ))}
        </div>

        {/* Price + delete */}
        <div className="text-right shrink-0 flex flex-col items-end gap-1">
          <span className="text-sm font-semibold tabular-nums">{fmt(computeItemTotal(item))}</span>
          {item.quantity > 1 && (
            <span className="text-xs text-muted-foreground tabular-nums">{fmt(unitPrice)} c/u</span>
          )}
          <button
            onClick={() => removeItem(item.uid)}
            className="text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Cart Drawer ──────────────────────────────────────────────────────────────

interface CartDrawerProps {
  open: boolean
  onClose: () => void
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { slug, menuId } = useParams<{ slug: string; menuId: string }>()
  const { state, totalItems, clearCart } = useCart()
  const navigate = useNavigate()
  const total = computeCartTotal(state.items)

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 bg-black/40 z-40 transition-opacity',
          open ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full w-full max-w-sm bg-background border-l shadow-xl z-50 flex flex-col transition-transform duration-300',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="font-semibold text-base flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Tu pedido
            {totalItems > 0 && (
              <span className="text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5">
                {totalItems}
              </span>
            )}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-sm">
            Cerrar
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5">
          {state.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
              <ShoppingCart className="h-10 w-10 opacity-20" />
              <p className="text-sm">Tu pedido está vacío</p>
            </div>
          ) : (
            <div className="divide-y">
              {state.items.map((item) => (
                <CartItemRow key={item.uid} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {state.items.length > 0 && (
          <div className="border-t px-5 py-4 flex flex-col gap-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="font-bold text-base tabular-nums">{fmt(total)}</span>
            </div>
            <Button
              className="w-full"
              onClick={() => {
                onClose()
                navigate(`/menu/${slug}/${menuId}/checkout`)
              }}
            >
              Ir al resumen del pedido
            </Button>
            <button
              onClick={clearCart}
              className="text-xs text-muted-foreground hover:text-destructive text-center transition-colors"
            >
              Vaciar pedido
            </button>
          </div>
        )}
      </div>
    </>
  )
}
