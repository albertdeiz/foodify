import { useState, useEffect } from 'react'
import { Minus, Plus, ShoppingCart, ImageOff } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Separator } from '@/shared/components/ui/separator'
import { cn } from '@/shared/lib/utils'
import { usePublicProductDetail } from '../hooks/use-public'
import { useCart, computeUnitPrice } from '../context/cart.context'
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

function fmt(cents: number) {
  return (cents / 100).toFixed(2) + ' €'
}

function fmtAdj(cents: number) {
  if (cents === 0) return 'Gratis'
  const sign = cents > 0 ? '+' : ''
  return `${sign}${(cents / 100).toFixed(2)} €`
}

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

// ─── Complement Type Section ──────────────────────────────────────────────────

function ComplementSection({
  ct,
  selected,
  onChange,
}: {
  ct: PublicComplementType
  selected: CartSelectedOption[]
  onChange: (options: CartSelectedOption[]) => void
}) {
  const isMulti = ct.max_selectable > 1
  const selectedIds = new Set(selected.map((o) => o.id))

  function toggle(opt: PublicComplementType['product_complements'][number]) {
    const next: CartSelectedOption = { id: opt.id, name: opt.name, price: opt.price, increment: opt.increment }
    if (!isMulti) {
      // Radio behaviour
      onChange(selectedIds.has(opt.id) ? [] : [next])
    } else {
      if (selectedIds.has(opt.id)) {
        onChange(selected.filter((o) => o.id !== opt.id))
      } else if (selected.length < ct.max_selectable) {
        onChange([...selected, next])
      }
    }
  }

  const missing = ct.required ? Math.max(0, (ct.min_selectable || 1) - selected.length) : 0

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold">{ct.name}</p>
        <span className="text-xs text-muted-foreground">
          {ct.required ? (
            <span className={cn('font-medium', missing > 0 ? 'text-destructive' : 'text-green-600')}>
              {missing > 0 ? `Elige ${ct.min_selectable || 1}` : '✓ Listo'}
            </span>
          ) : (
            `Hasta ${ct.max_selectable}`
          )}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        {ct.product_complements.map((opt) => {
          const checked = selectedIds.has(opt.id)
          const disabled = !checked && isMulti && selected.length >= ct.max_selectable
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
              <span className="text-xs text-muted-foreground tabular-nums">{fmtAdj(opt.price)}</span>
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
  selected,
  onChange,
}: {
  slot: PublicComboItem
  selected: CartSelectedOption | undefined
  onChange: (option: CartSelectedOption | undefined) => void
}) {
  if (slot.product) {
    return (
      <div className="flex items-center justify-between rounded-lg border px-3 py-2.5 bg-muted/30">
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">Incluido</p>
          <p className="text-sm font-medium">{slot.product.name}</p>
        </div>
        <Badge variant="outline" className="text-xs">Fijo</Badge>
      </div>
    )
  }

  if (slot.complement_type) {
    const ct = slot.complement_type
    const selectedId = selected?.id
    return (
      <div>
        <p className="text-sm font-semibold mb-2">
          {ct.name}
          <span className={cn('ml-2 text-xs font-normal', !selected ? 'text-destructive' : 'text-green-600')}>
            {!selected ? '— Elige una opción' : '✓'}
          </span>
        </p>
        <div className="flex flex-col gap-1">
          {ct.product_complements.map((opt) => {
            const checked = selectedId === opt.id
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChange(checked ? undefined : { id: opt.id, name: opt.name, price: opt.price, increment: opt.increment })}
                className={cn(
                  'flex items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-colors',
                  checked && 'border-primary bg-primary/5',
                  !checked && 'hover:bg-muted/50',
                )}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'h-4 w-4 rounded-full border-2 shrink-0',
                      checked ? 'border-primary bg-primary' : 'border-muted-foreground',
                    )}
                  />
                  <span className="text-sm">{opt.name}</span>
                </div>
                {opt.price !== 0 && (
                  <span className="text-xs text-muted-foreground tabular-nums">{fmtAdj(opt.price)}</span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return null
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
  const { addItem } = useCart()

  // Complement selections: typeId → CartSelectedOption[]
  const [complementSelections, setComplementSelections] = useState<Record<number, CartSelectedOption[]>>(() =>
    Object.fromEntries(product.complement_types.map((ct) => [ct.id, []]))
  )

  // Combo slot selections: slotId → CartSelectedOption | undefined
  const [comboSelections, setComboSelections] = useState<Record<number, CartSelectedOption | undefined>>({})

  const [quantity, setQuantity] = useState(1)

  // Reset when product changes
  useEffect(() => {
    setComplementSelections(Object.fromEntries(product.complement_types.map((ct) => [ct.id, []])))
    setComboSelections({})
    setQuantity(1)
  }, [product.id])

  // Build a temporary CartItem to compute the live price
  const tempItem: CartItem = {
    uid: '',
    productId: product.id,
    productName: product.name,
    productImage: product.image_url,
    productType: product.type,
    menuPrice,
    complements: product.complement_types.map((ct) => ({
      typeId: ct.id,
      typeName: ct.name,
      required: ct.required,
      min_selectable: ct.min_selectable,
      max_selectable: ct.max_selectable,
      selectedOptions: complementSelections[ct.id] ?? [],
    })),
    comboSlots: [],
    quantity: 1,
  }
  const unitPrice = computeUnitPrice(tempItem)

  // Validation
  const requiredErrors = product.complement_types.filter((ct) => {
    if (!ct.required) return false
    const count = (complementSelections[ct.id] ?? []).length
    return count < (ct.min_selectable || 1)
  })
  const flexibleSlots = product.combo_items.filter((s) => s.complement_type)
  const comboErrors = flexibleSlots.filter((s) => !comboSelections[s.id])
  const isValid = requiredErrors.length === 0 && comboErrors.length === 0

  function handleAdd() {
    const cartComplements: CartComplement[] = product.complement_types.map((ct) => ({
      typeId: ct.id,
      typeName: ct.name,
      required: ct.required,
      min_selectable: ct.min_selectable,
      max_selectable: ct.max_selectable,
      selectedOptions: complementSelections[ct.id] ?? [],
    }))

    const cartSlots: CartComboSlot[] = product.combo_items.map((slot) => ({
      slotId: slot.id,
      order: slot.order,
      fixedProduct: slot.product ? { id: slot.product.id, name: slot.product.name } : undefined,
      complementTypeId: slot.complement_type?.id,
      complementTypeName: slot.complement_type?.name,
      selectedOption: comboSelections[slot.id],
    }))

    addItem({
      uid: uid(),
      productId: product.id,
      productName: product.name,
      productImage: product.image_url,
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
      {product.image_url ? (
        <img src={product.image_url} alt={product.name} className="w-full h-44 object-cover rounded-xl" />
      ) : null}

      {/* Header */}
      <DialogHeader>
        <div className="flex items-start justify-between gap-3">
          <DialogTitle className="text-lg leading-snug flex-1">{product.name}</DialogTitle>
          <span className="text-lg font-bold tabular-nums shrink-0">{fmt(unitPrice)}</span>
        </div>
        {unitPrice !== menuPrice && (
          <p className="text-xs text-muted-foreground">Base: {fmt(menuPrice)} + opciones</p>
        )}
      </DialogHeader>

      {product.description && (
        <p className="text-sm text-muted-foreground leading-relaxed -mt-2">{product.description}</p>
      )}
      {product.content && (
        <p className="text-xs font-medium text-muted-foreground -mt-3">{product.content}</p>
      )}

      {/* Complement types */}
      {product.complement_types.length > 0 && (
        <>
          <Separator />
          <div className="flex flex-col gap-5">
            {product.complement_types.map((ct) => (
              <ComplementSection
                key={ct.id}
                ct={ct}
                selected={complementSelections[ct.id] ?? []}
                onChange={(opts) =>
                  setComplementSelections((prev) => ({ ...prev, [ct.id]: opts }))
                }
              />
            ))}
          </div>
        </>
      )}

      {/* Combo slots */}
      {product.combo_items.length > 0 && (
        <>
          <Separator />
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground -mb-2">
            Compuesto por
          </p>
          <div className="flex flex-col gap-4">
            {product.combo_items.map((slot) => (
              <ComboSlotSection
                key={slot.id}
                slot={slot}
                selected={comboSelections[slot.id]}
                onChange={(opt) =>
                  setComboSelections((prev) => ({ ...prev, [slot.id]: opt }))
                }
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
            Añadir · {fmt(unitPrice * quantity)}
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
