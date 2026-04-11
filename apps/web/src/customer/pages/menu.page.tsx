import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { ShoppingCart, ImageOff, ChevronRight } from 'lucide-react'
import { Badge } from '@/shared/components/ui/badge'
import { cn } from '@/shared/lib/utils'
import { usePublicMenu, useRestaurant } from '../hooks/use-public'
import { useCart } from '../context/cart.context'
import { DEFAULT_CURRENCY } from '@/shared/lib/currency'
import { ProductSheet } from '../components/product-sheet'
import { CartDrawer } from '../components/cart-drawer'
import { formatPrice } from '@/shared/lib/format-price'
import type { PublicMenuProduct, PublicMenuCategory } from '../types'

const TYPE_BADGE: Record<string, 'default' | 'secondary' | 'outline'> = {
  REGULAR: 'outline',
  COMPLEMENTED: 'secondary',
  COMBO: 'default',
}

// ─── Product card ─────────────────────────────────────────────────────────────

function ProductCard({
  product,
  onClick,
  currency,
}: {
  product: PublicMenuProduct
  onClick: () => void
  currency: string
}) {
  const hasSpecialPrice = product.price !== product.basePrice

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-start gap-3 w-full text-left p-4 hover:bg-muted/30 transition-colors group"
    >
      {product.imageUrl ? (
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-20 h-20 rounded-xl object-cover shrink-0 border"
        />
      ) : (
        <div className="w-20 h-20 rounded-xl border bg-muted/50 flex items-center justify-center shrink-0">
          <ImageOff className="h-5 w-5 text-muted-foreground/30" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
          <span className="font-medium text-sm">{product.name}</span>
          {product.type !== 'REGULAR' && (
            <Badge variant={TYPE_BADGE[product.type] ?? 'outline'} className="text-[10px] px-1.5">
              {product.type === 'COMPLEMENTED' ? 'Personalizable' : 'Combo'}
            </Badge>
          )}
        </div>
        {product.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}
        {product.content && (
          <p className="text-xs text-muted-foreground font-medium mt-0.5">{product.content}</p>
        )}
      </div>
      <div className="shrink-0 text-right flex items-center gap-1">
        <div>
          <p className="text-sm font-bold tabular-nums">{formatPrice(product.price, currency)}</p>
          {hasSpecialPrice && (
            <p className="text-xs text-muted-foreground line-through tabular-nums">
              {formatPrice(product.basePrice, currency)}
            </p>
          )}
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-60 transition-opacity" />
      </div>
    </button>
  )
}

// ─── Category nav ─────────────────────────────────────────────────────────────

function CategoryNav({
  categories,
  activeId,
  onSelect,
}: {
  categories: PublicMenuCategory[]
  activeId: number | null
  onSelect: (id: number) => void
}) {
  return (
    <div className="bg-background overflow-x-auto">
      <div className="flex gap-1 px-4 py-2 min-w-max">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors',
              activeId === cat.id
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted',
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export function MenuPage() {
  const { slug, menuId } = useParams<{ slug: string; menuId: string }>()
  const mid = Number(menuId)

  const { data: menu, isLoading } = usePublicMenu(slug!, mid)
  const { data: restaurant } = useRestaurant(slug!)
  const { setMenu, totalItems, currency } = useCart()
  const [selectedProduct, setSelectedProduct] = useState<PublicMenuProduct | null>(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [activeCatId, setActiveCatId] = useState<number | null>(null)
  const sectionRefs = useRef<Record<number, HTMLElement | null>>({})

  useEffect(() => {
    if (slug && mid) setMenu(slug, mid, restaurant?.currency ?? DEFAULT_CURRENCY)
  }, [slug, mid, restaurant?.currency])

  useEffect(() => {
    if (menu?.categories.length) setActiveCatId(menu.categories[0].id)
  }, [menu])

  // Scroll to category section
  function scrollToCategory(id: number) {
    setActiveCatId(id)

    const top = (sectionRefs.current[id]?.offsetTop ?? 0) - 94
    window.scrollTo({ top, behavior: 'smooth' })
  }

  // Observe sections to update active category
  useEffect(() => {
    if (!menu) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = Number(entry.target.getAttribute('data-cat-id'))
            if (id) setActiveCatId(id)
          }
        }
      },
      { rootMargin: '-30% 0px -60% 0px' },
    )
    for (const el of Object.values(sectionRefs.current)) {
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [menu])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-sm text-muted-foreground">Cargando carta...</p>
      </div>
    )
  }

  if (!menu) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-sm text-muted-foreground">Carta no encontrada.</p>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto relative">
      {/* Top bar */}
      <div className="border-b bg-background sticky top-0 z-20">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h1 className="font-semibold text-base truncate">{menu.name}</h1>
          <button
            onClick={() => setCartOpen(true)}
            className="relative flex items-center gap-1.5 text-sm font-medium"
          >
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        </div>

        {/* Category nav */}
        {menu.categories.length > 1 && (
          <CategoryNav
            categories={menu.categories}
            activeId={activeCatId}
            onSelect={scrollToCategory}
          />
        )}
      </div>

      {/* Products by category */}
      <div className="pb-32">
        {menu.categories.map((cat) => (
          <section
            key={cat.id}
            data-cat-id={cat.id}
            ref={(el) => { sectionRefs.current[cat.id] = el }}
          >
            <div className="px-4 pt-6 pb-2">
              <h2 className="text-base font-bold">{cat.name}</h2>
            </div>
            <div className="divide-y border-t border-b">
              {cat.products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={() => setSelectedProduct(product)}
                  currency={currency}
                />
              ))}
              {cat.products.length === 0 && (
                <p className="px-4 py-4 text-sm text-muted-foreground">Sin productos disponibles.</p>
              )}
            </div>
          </section>
        ))}
      </div>

      {/* Floating cart button */}
      {totalItems > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 max-w-[calc(512px-2rem)] w-[calc(100%-2rem)]">
          <button
            onClick={() => setCartOpen(true)}
            className="w-full flex items-center justify-between bg-primary text-primary-foreground rounded-2xl px-5 py-3.5 shadow-lg font-medium"
          >
            <span className="bg-primary-foreground/20 rounded-lg px-2 py-0.5 text-sm">
              {totalItems} {totalItems === 1 ? 'producto' : 'productos'}
            </span>
            <span>Ver pedido</span>
            <span className="text-sm opacity-80">›</span>
          </button>
        </div>
      )}

      {/* Product customization dialog */}
      <ProductSheet
        slug={slug!}
        product={selectedProduct}
        menuPrice={selectedProduct?.price ?? 0}
        onClose={() => setSelectedProduct(null)}
      />

      {/* Cart drawer */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  )
}
