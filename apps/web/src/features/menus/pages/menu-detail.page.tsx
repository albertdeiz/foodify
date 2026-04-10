import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronLeft, ImageOff, ChevronRight } from 'lucide-react'
import { Badge } from '@/shared/components/ui/badge'
import { Separator } from '@/shared/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog'
import { cn } from '@/shared/lib/utils'
import { useMenuContent } from '../hooks/use-menus'
import { useProductDetail } from '@/features/products/hooks/use-products'
import type { MenuProduct } from '../types'
import type { ProductWithDetails, ComboItem } from '@/features/products/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatPrice(cents: number) {
  return (cents / 100).toFixed(2) + ' €'
}

function formatPriceAdjust(cents: number) {
  if (cents === 0) return 'Gratis'
  const sign = cents > 0 ? '+' : ''
  return `${sign}${(cents / 100).toFixed(2)} €`
}

const TYPE_LABEL: Record<string, string> = {
  REGULAR: 'Regular',
  COMPLEMENTED: 'Con complementos',
  COMBO: 'Combo',
}

const TYPE_BADGE: Record<string, 'default' | 'secondary' | 'outline'> = {
  REGULAR: 'outline',
  COMPLEMENTED: 'secondary',
  COMBO: 'default',
}

// ─── Product Detail Dialog ────────────────────────────────────────────────────
function ProductDetailDialog({
  workspaceId,
  productId,
  menuPrice,
  basePrice,
  onClose,
}: {
  workspaceId: number
  productId: number | null
  menuPrice: number
  basePrice: number
  onClose: () => void
}) {
  const { data: product, isLoading } = useProductDetail(workspaceId, productId)
  const hasSpecialPrice = menuPrice !== basePrice

  return (
    <Dialog open={!!productId} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        {isLoading || !product ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Cargando...</div>
        ) : (
          <ProductDetailContent
            product={product}
            menuPrice={menuPrice}
            basePrice={basePrice}
            hasSpecialPrice={hasSpecialPrice}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function ProductDetailContent({
  product,
  menuPrice,
  basePrice,
  hasSpecialPrice,
}: {
  product: ProductWithDetails
  menuPrice: number
  basePrice: number
  hasSpecialPrice: boolean
}) {
  return (
    <>
      <DialogHeader>
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <DialogTitle className="text-base leading-snug">{product.name}</DialogTitle>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge variant={TYPE_BADGE[product.type] ?? 'outline'} className="text-xs">
                {TYPE_LABEL[product.type] ?? product.type}
              </Badge>
              {!product.isAvailable && (
                <Badge variant="secondary" className="text-xs">No disponible</Badge>
              )}
            </div>
          </div>
          {/* Precio */}
          <div className="text-right shrink-0">
            <p className="text-lg font-bold tabular-nums">{formatPrice(menuPrice)}</p>
            {hasSpecialPrice && (
              <p className="text-xs text-muted-foreground line-through tabular-nums">
                {formatPrice(basePrice)}
              </p>
            )}
            {hasSpecialPrice && (
              <Badge className="text-[10px]">Precio carta</Badge>
            )}
          </div>
        </div>
      </DialogHeader>

      {/* Imagen */}
      {product.imageUrl && (
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-44 object-cover rounded-lg border"
        />
      )}

      {/* Descripción + contenido */}
      {(product.description || product.content) && (
        <div className="flex flex-col gap-1">
          {product.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
          )}
          {product.content && (
            <p className="text-xs font-medium text-muted-foreground">{product.content}</p>
          )}
        </div>
      )}

      {/* Complementos */}
      {product.complementTypes.length > 0 && (
        <div className="flex flex-col gap-3">
          <Separator />
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Personalización
          </p>
          {product.complementTypes.map((ct) => (
            <div key={ct.id}>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-sm font-medium">{ct.name}</p>
                <span className="text-xs text-muted-foreground">
                  {ct.required ? 'Requerido' : 'Opcional'} · máx {ct.maxSelectable}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                {ct.productComplements
                  .filter((c) => !c.isDisabled)
                  .map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-1.5"
                    >
                      <span className="text-sm">{c.name}</span>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {formatPriceAdjust(c.price)}
                      </span>
                    </div>
                  ))}
                {ct.productComplements.filter((c) => !c.isDisabled).length === 0 && (
                  <p className="text-xs text-muted-foreground px-1">Sin opciones activas.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slots del combo */}
      {product.type === 'COMBO' && product.comboItems.length > 0 && (
        <div className="flex flex-col gap-3">
          <Separator />
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Compuesto por
          </p>
          {product.comboItems.map((item) => (
            <ComboItemRow key={item.id} item={item} />
          ))}
        </div>
      )}
    </>
  )
}

function ComboItemRow({ item }: { item: ComboItem }) {
  if (!item.product) return null
  return (
    <div className="rounded-md border px-3 py-2">
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground w-5 shrink-0">#{item.order}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{item.product.name}</p>
          {item.product.description && (
            <p className="text-xs text-muted-foreground truncate">{item.product.description}</p>
          )}
        </div>
        <Badge variant="outline" className="text-xs shrink-0">Fijo</Badge>
        <span className="text-xs tabular-nums text-muted-foreground shrink-0">
          {formatPrice(item.product.price)}
        </span>
      </div>
    </div>
  )
}

// ─── Product Row (lista) ──────────────────────────────────────────────────────
function ProductRow({
  product,
  onClick,
}: {
  product: MenuProduct
  onClick: () => void
}) {
  const hasSpecialPrice = product.price !== product.basePrice

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-start gap-4 px-4 py-4 bg-background w-full text-left transition-colors hover:bg-muted/40 group',
        !product.isAvailable && 'opacity-40',
      )}
    >
      {/* Imagen */}
      {product.imageUrl ? (
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-20 h-20 rounded-lg object-cover shrink-0 border"
        />
      ) : (
        <div className="w-20 h-20 rounded-lg border bg-muted flex items-center justify-center shrink-0">
          <ImageOff className="h-6 w-6 text-muted-foreground/40" />
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <span className="font-medium text-sm">{product.name}</span>
          <Badge variant={TYPE_BADGE[product.type] ?? 'outline'} className="text-xs">
            {TYPE_LABEL[product.type] ?? product.type}
          </Badge>
          {!product.isAvailable && (
            <Badge variant="secondary" className="text-xs">No disponible</Badge>
          )}
        </div>
        {product.description && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {product.description}
          </p>
        )}
        {product.content && (
          <p className="text-xs text-muted-foreground mt-1 font-medium">{product.content}</p>
        )}
      </div>

      {/* Precio + chevron */}
      <div className="text-right shrink-0 flex items-center gap-1">
        <div>
          <p className="text-sm font-semibold tabular-nums">{formatPrice(product.price)}</p>
          {hasSpecialPrice && (
            <p className="text-xs text-muted-foreground line-through tabular-nums">
              {formatPrice(product.basePrice)}
            </p>
          )}
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </button>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export function MenuDetailPage() {
  const { workspaceId, menuId } = useParams<{ workspaceId: string; menuId: string }>()
  const wid = Number(workspaceId)
  const mid = Number(menuId)

  const { data: menu, isLoading } = useMenuContent(wid, mid)

  const [selectedProduct, setSelectedProduct] = useState<MenuProduct | null>(null)

  if (isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Cargando carta...</div>
  }
  if (!menu) {
    return <div className="p-6 text-sm text-muted-foreground">Carta no encontrada.</div>
  }

  const totalProducts = menu.categories.reduce((sum, c) => sum + c.products.length, 0)

  return (
    <div className="p-6 max-w-3xl">
      {/* Cabecera */}
      <div className="flex items-start gap-3 mb-6">
        <Link
          to={`/workspaces/${workspaceId}/menus`}
          className="mt-1 text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-semibold">{menu.name}</h2>
            <Badge variant={menu.isActive ? 'default' : 'secondary'}>
              {menu.isActive ? 'Activa' : 'Inactiva'}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {menu.categories.length} {menu.categories.length === 1 ? 'categoría' : 'categorías'} · {totalProducts} {totalProducts === 1 ? 'producto' : 'productos'}
          </p>
        </div>
      </div>

      {/* Categorías y productos */}
      {menu.categories.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p>Esta carta no tiene categorías asignadas.</p>
          <p className="text-xs mt-1">Asígnalas desde la gestión de cartas.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {menu.categories.map((cat) => (
            <section key={cat.id}>
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-base font-semibold">{cat.name}</h3>
                <Separator className="flex-1" />
                <span className="text-xs text-muted-foreground shrink-0">
                  {cat.products.length} {cat.products.length === 1 ? 'producto' : 'productos'}
                </span>
              </div>

              {cat.products.length === 0 ? (
                <p className="text-sm text-muted-foreground px-1">
                  Esta categoría no tiene productos asignados.
                </p>
              ) : (
                <div className="flex flex-col divide-y border rounded-lg overflow-hidden">
                  {cat.products.map((product) => (
                    <ProductRow
                      key={product.id}
                      product={product}
                      onClick={() => setSelectedProduct(product)}
                    />
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}

      {/* Dialog de detalle */}
      <ProductDetailDialog
        workspaceId={wid}
        productId={selectedProduct?.id ?? null}
        menuPrice={selectedProduct?.price ?? 0}
        basePrice={selectedProduct?.basePrice ?? 0}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  )
}
