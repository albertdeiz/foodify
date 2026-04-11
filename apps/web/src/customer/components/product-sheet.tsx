import { useState, useEffect } from 'react'
import { Minus, Plus, ShoppingCart, ImageOff } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Separator } from '@/shared/components/ui/separator'
import { cn } from '@/shared/lib/utils'
import { usePublicProductDetail } from '../hooks/use-public'
import { useCart, computeUnitPrice } from '../context/cart.context'
import { formatPrice, formatPriceAdjust } from '@/shared/lib/format-price'
import type {
  PublicMenuProduct,
  PublicProductDetail,
  PublicComplementType,
  PublicComboItem,
  CartItem,
  CartComplement,
  CartComboSlot,
  CartSelectedOption,
} from '../types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

// ─── Complement Type Section ──────────────────────────────────────────────────

function ComplementSection({
  ct,
  selected,
  onChange,
  currency,
}: {
  ct: PublicComplementType
  selected: CartSelectedOption[]
  onChange: (options: CartSelectedOption[]) => void
  currency: string
}) {
  const isMulti = ct.maxSelectable > 1
  const selectedIds = new Set(selected.map((o) => o.id))

  function toggle(opt: PublicComplementType['productComplements'][number]) {
    const next: CartSelectedOption = { id: opt.id, name: opt.name, price: opt.price, increment: opt.increment }
    if (!isMulti) {
      // Radio behaviour
      onChange(selectedIds.has(opt.id) ? [] : [next])
    } else {
      if (selectedIds.has(opt.id)) {
        onChange(selected.filter((o) => o.id !== opt.id))
      } else if (selected.length < ct.maxSelectable) {
        onChange([...selected, next])
      }
    }
  }

  const missing = ct.required ? Math.max(0, (ct.minSelectable || 1) - selected.length) : 0

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold">{ct.name}</p>
        <span className="text-xs text-muted-foreground">
          {ct.required ? (
            <span className={cn('font-medium', missing > 0 ? 'text-destructive' : 'text-green-600')}>
              {missing > 0 ? `Elige ${ct.minSelectable || 1}` : '✓ Listo'}
            </span>
          ) : (
            `Hasta ${ct.maxSelectable}`
          )}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        {ct.productComplements.map((opt) => {
          const checked = selectedIds.has(opt.id)
          const disabled = !checked && isMulti && selected.length >= ct.maxSelectable
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => !disabled && toggle(opt)}
              className={cn(
                'flex items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-colors',
                checked && 'border-primary bg-primary/5',
                disabled && 'opacity-40 cursor-not-allowed',
                !checked && !disabled && 'hover:bg-muted/50',
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    'h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center',
                    !isMulti && (checked ? 'border-primary bg-primary' : 'border-muted-foreground'),
                    isMulti && (checked ? 'border-primary bg-primary rounded-sm' : 'border-muted-foreground rounded-sm'),
                  )}
                >
                  {checked && <span className="block h-1.5 w-1.5 rounded-full bg-white" />}
                </span>
                <span className="text-sm">{opt.name}</span>
              </div>
              <span className="text-xs text-muted-foreground tabular-nums">{formatPriceAdjust(opt.price, currency)}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Combo Slot Section ───────────────────────────────────────────────────────

function ComboSlotSection({
  slot,
  complementSelections,
  onComplementChange,
  currency,
}: {
  slot: PublicComboItem
  complementSelections: Record<number, CartSelectedOption[]>
  onComplementChange: (typeId: number, options: CartSelectedOption[]) => void
  currency: string
}) {
  if (!slot.product) return null
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between rounded-lg border px-3 py-2.5 bg-muted/30">
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">Incluido</p>
          <p className="text-sm font-medium">{slot.product.name}</p>
        </div>
        <Badge variant="outline" className="text-xs">Fijo</Badge>
      </div>
      {slot.product.complementTypes.map((ct) => (
        <div key={ct.id} className="pl-3 border-l-2 border-muted">
          <ComplementSection
            ct={ct}
            selected={complementSelections[ct.id] ?? []}
            onChange={(opts) => onComplementChange(ct.id, opts)}
            currency={currency}
          />
        </div>
      ))}
    </div>
  )
}

// ─── Sheet Content ────────────────────────────────────────────────────────────

function SheetContent({
  product,
  menuPrice,
  slug,
  onAdded,
}: {
  product: PublicProductDetail
  menuPrice: number
  slug: string
  onAdded: () => void
}) {
  const { addItem, currency } = useCart()

  // Complement selections: typeId → CartSelectedOption[]
  const [complementSelections, setComplementSelections] = useState<Record<number, CartSelectedOption[]>>(() =>
    Object.fromEntries(product.complementTypes.map((ct) => [ct.id, []]))
  )

  // Per-slot complement selections: slotId → typeId → CartSelectedOption[]
  const [slotComplementSelections, setSlotComplementSelections] = useState<
    Record<number, Record<number, CartSelectedOption[]>>
  >(() =>
    Object.fromEntries(
      product.comboItems.map((slot) => [
        slot.id,
        Object.fromEntries((slot.product?.complementTypes ?? []).map((ct) => [ct.id, []])),
      ]),
    )
  )

  const [quantity, setQuantity] = useState(1)

  // Reset when product changes
  useEffect(() => {
    setComplementSelections(Object.fromEntries(product.complementTypes.map((ct) => [ct.id, []])))
    setSlotComplementSelections(
      Object.fromEntries(
        product.comboItems.map((slot) => [
          slot.id,
          Object.fromEntries((slot.product?.complementTypes ?? []).map((ct) => [ct.id, []])),
        ]),
      ),
    )
    setQuantity(1)
  }, [product.id])

  // Build a temporary CartItem to compute the live price
  const tempItem: CartItem = {
    uid: '',
    productId: product.id,
    productName: product.name,
    productImage: product.imageUrl,
    productType: product.type,
    menuPrice,
    complements: product.complementTypes.map((ct) => ({
      typeId: ct.id,
      typeName: ct.name,
      required: ct.required,
      minSelectable: ct.minSelectable,
      maxSelectable: ct.maxSelectable,
      selectedOptions: complementSelections[ct.id] ?? [],
    })),
    comboSlots: product.comboItems.map((slot) => ({
      slotId: slot.id,
      order: slot.order,
      fixedProduct: slot.product ? { id: slot.product.id, name: slot.product.name } : undefined,
      complements: (slot.product?.complementTypes ?? []).map((ct) => ({
        typeId: ct.id,
        typeName: ct.name,
        required: ct.required,
        minSelectable: ct.minSelectable,
        maxSelectable: ct.maxSelectable,
        selectedOptions: slotComplementSelections[slot.id]?.[ct.id] ?? [],
      })),
    })),
    quantity: 1,
  }
  const unitPrice = computeUnitPrice(tempItem)

  // Validation
  const requiredErrors = product.complementTypes.filter((ct) => {
    if (!ct.required) return false
    return (complementSelections[ct.id] ?? []).length < (ct.minSelectable || 1)
  })
  const slotRequiredErrors = product.comboItems.flatMap((slot) =>
    (slot.product?.complementTypes ?? []).filter((ct) => {
      if (!ct.required) return false
      return (slotComplementSelections[slot.id]?.[ct.id] ?? []).length < (ct.minSelectable || 1)
    }),
  )
  const isValid = requiredErrors.length === 0 && slotRequiredErrors.length === 0

  function handleAdd() {
    const cartComplements: CartComplement[] = product.complementTypes.map((ct) => ({
      typeId: ct.id,
      typeName: ct.name,
      required: ct.required,
      minSelectable: ct.minSelectable,
      maxSelectable: ct.maxSelectable,
      selectedOptions: complementSelections[ct.id] ?? [],
    }))

    const cartSlots: CartComboSlot[] = product.comboItems.map((slot) => ({
      slotId: slot.id,
      order: slot.order,
      fixedProduct: slot.product ? { id: slot.product.id, name: slot.product.name } : undefined,
      complements: (slot.product?.complementTypes ?? []).map((ct) => ({
        typeId: ct.id,
        typeName: ct.name,
        required: ct.required,
        minSelectable: ct.minSelectable,
        maxSelectable: ct.maxSelectable,
        selectedOptions: slotComplementSelections[slot.id]?.[ct.id] ?? [],
      })),
    }))

    addItem({
      uid: uid(),
      productId: product.id,
      productName: product.name,
      productImage: product.imageUrl,
      productType: product.type,
      menuPrice,
      complements: cartComplements,
      comboSlots: cartSlots,
      quantity,
    })
    onAdded()
  }

  return (
    <div className="relative flex flex-col gap-5">
      {/* Image */}
      {product.imageUrl ? (
        <img src={product.imageUrl} alt={product.name} className="w-full h-44 object-cover rounded-xl" />
      ) : null}

      {/* Header */}
      <DialogHeader>
        <div className="flex items-start justify-between gap-3">
          <DialogTitle className="text-lg leading-snug flex-1">{product.name}</DialogTitle>
          <span className="text-lg font-bold tabular-nums shrink-0">{formatPrice(unitPrice, currency)}</span>
        </div>
        {unitPrice !== menuPrice && (
          <p className="text-xs text-muted-foreground">Base: {formatPrice(menuPrice, currency)} + opciones</p>
        )}
      </DialogHeader>

      {product.description && (
        <p className="text-sm text-muted-foreground leading-relaxed -mt-2">{product.description}</p>
      )}
      {product.content && (
        <p className="text-xs font-medium text-muted-foreground -mt-3">{product.content}</p>
      )}

      {/* Complement types */}
      {product.complementTypes.length > 0 && (
        <>
          <Separator />
          <div className="flex flex-col gap-5">
            {product.complementTypes.map((ct) => (
              <ComplementSection
                key={ct.id}
                ct={ct}
                selected={complementSelections[ct.id] ?? []}
                onChange={(opts) =>
                  setComplementSelections((prev) => ({ ...prev, [ct.id]: opts }))
                }
                currency={currency}
              />
            ))}
          </div>
        </>
      )}

      {/* Combo slots */}
      {product.comboItems.length > 0 && (
        <>
          <Separator />
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground -mb-2">
            Compuesto por
          </p>
          <div className="flex flex-col gap-4">
            {product.comboItems.map((slot) => (
              <ComboSlotSection
                key={slot.id}
                slot={slot}
                complementSelections={slotComplementSelections[slot.id] ?? {}}
                onComplementChange={(typeId, opts) =>
                  setSlotComplementSelections((prev) => ({
                    ...prev,
                    [slot.id]: { ...prev[slot.id], [typeId]: opts },
                  }))
                }
                currency={currency}
              />
            ))}
          </div>
        </>
      )}

      <div className="sticky bottom-0 bg-white flex flex-col gap-5">
        <Separator />
        {/* Quantity + Add */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 border rounded-lg">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-6 text-center text-sm font-semibold tabular-nums">{quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10"
              onClick={() => setQuantity((q) => q + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <Button
            className="flex-1 gap-2"
            disabled={!isValid}
            onClick={handleAdd}
          >
            <ShoppingCart className="h-4 w-4" />
            Añadir · {formatPrice(unitPrice * quantity, currency)}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Public Dialog ────────────────────────────────────────────────────────────

export function ProductSheet({
  slug,
  product,
  menuPrice,
  onClose,
}: {
  slug: string
  product: PublicMenuProduct | null
  menuPrice: number
  onClose: () => void
}) {
  const { data: detail, isLoading } = usePublicProductDetail(slug, product?.id ?? null)

  return (
    <Dialog open={!!product} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="max-w-lg max-h-[92vh] overflow-y-auto">
        {isLoading || !detail ? (
          <div className="py-10 text-center text-sm text-muted-foreground">Cargando...</div>
        ) : (
          <SheetContent
            product={detail}
            menuPrice={menuPrice}
            slug={slug}
            onAdded={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
