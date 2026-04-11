import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, ShoppingBag, CheckCircle2, Minus, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Separator } from '@/shared/components/ui/separator'
import { useCart, computeUnitPrice, computeItemTotal, computeCartTotal } from '../context/cart.context'
import { formatPrice } from '@/shared/lib/format-price'
import type { CartItem } from '../types'

function ItemSummary({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem, currency } = useCart()
  const unitPrice = computeUnitPrice(item)
  const totalPrice = computeItemTotal(item)

  const activeComplements = item.complements.filter((c) => c.selectedOptions.length > 0)
  const comboSlots = item.comboSlots.filter((s) => s.fixedProduct)

  return (
    <div className="py-4 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm leading-snug">{item.productName}</p>

          {/* Complement lines */}
          {activeComplements.map((c) => (
            <div key={c.typeId} className="mt-1">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">{c.typeName}:</span>{' '}
                {c.selectedOptions.map((o) => o.name).join(', ')}
                {c.selectedOptions.filter((o) => o.increment && o.price > 0).length > 0 && (
                  <span className="ml-1 text-muted-foreground/70">
                    (+{formatPrice(c.selectedOptions.filter((o) => o.increment).reduce((s, o) => s + o.price, 0), currency)})
                  </span>
                )}
              </p>
            </div>
          ))}

          {/* Combo slot lines */}
          {comboSlots.map((s) => (
            <div key={s.slotId} className="mt-1">
              <p className="text-xs text-muted-foreground">Incluido: {s.fixedProduct!.name}</p>
              {s.complements.filter((c) => c.selectedOptions.length > 0).map((c) => (
                <p key={c.typeId} className="text-xs text-muted-foreground pl-3">
                  <span className="font-medium">{c.typeName}:</span>{' '}
                  {c.selectedOptions.map((o) => o.name).join(', ')}
                  {c.selectedOptions.filter((o) => o.increment && o.price > 0).length > 0 && (
                    <span className="ml-1 text-muted-foreground/70">
                      (+{formatPrice(c.selectedOptions.filter((o) => o.increment).reduce((acc, o) => acc + o.price, 0), currency)})
                    </span>
                  )}
                </p>
              ))}
            </div>
          ))}
        </div>

        <div className="shrink-0 text-right">
          <p className="text-sm font-bold tabular-nums">{formatPrice(totalPrice, currency)}</p>
          {item.quantity > 1 && (
            <p className="text-xs text-muted-foreground tabular-nums">{formatPrice(unitPrice, currency)} × {item.quantity}</p>
          )}
        </div>
      </div>

      {/* Quantity controls */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 border rounded-lg">
          <button
            className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-foreground"
            onClick={() => updateQuantity(item.uid, item.quantity - 1)}
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-6 text-center text-sm font-semibold tabular-nums">{item.quantity}</span>
          <button
            className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-foreground"
            onClick={() => updateQuantity(item.uid, item.quantity + 1)}
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
        <button
          onClick={() => removeItem(item.uid)}
          className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" /> Eliminar
        </button>
      </div>
    </div>
  )
}

export function CheckoutPage() {
  const { slug, menuId } = useParams<{ slug: string; menuId: string }>()
  const navigate = useNavigate()
  const { state, clearCart, currency } = useCart()
  const [confirmed, setConfirmed] = useState(false)

  const total = computeCartTotal(state.items)

  if (confirmed) {
    return (
      <div className="max-w-lg mx-auto flex flex-col items-center justify-center min-h-screen px-6 text-center gap-5">
        <CheckCircle2 className="h-16 w-16 text-green-500" />
        <div>
          <h2 className="text-xl font-bold mb-1">¡Pedido recibido!</h2>
          <p className="text-sm text-muted-foreground">
            El equipo ha recibido tu pedido. Enseguida lo preparamos.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            clearCart()
            navigate(`/menu/${slug}/${menuId}`)
          }}
        >
          Volver a la carta
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 pb-32">
      {/* Header */}
      <div className="flex items-center gap-3 py-4 sticky top-0 bg-background z-10 border-b mb-2">
        <button
          onClick={() => navigate(-1)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="font-semibold text-base flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          Resumen del pedido
        </h1>
      </div>

      {state.items.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-sm">No hay productos en el pedido.</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => navigate(`/menu/${slug}/${menuId}`)}
          >
            Volver a la carta
          </Button>
        </div>
      ) : (
        <>
          {/* Items */}
          <div className="divide-y">
            {state.items.map((item) => (
              <ItemSummary key={item.uid} item={item} />
            ))}
          </div>

          <Separator className="my-4" />

          {/* Totals */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatPrice(total, currency)}</span>
            </div>
            <div className="flex justify-between font-bold text-base">
              <span>Total</span>
              <span className="tabular-nums">{formatPrice(total, currency)}</span>
            </div>
          </div>

          {/* Confirm button */}
          <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto px-4 py-4 bg-background border-t">
            <Button className="w-full h-12 text-base" onClick={() => setConfirmed(true)}>
              Confirmar pedido · {formatPrice(total, currency)}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
