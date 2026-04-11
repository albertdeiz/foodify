import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react'
import { DEFAULT_CURRENCY, type Currency } from '@/shared/lib/currency'
import type { CartItem, CartComplement, CartComboSlot } from '../types'

// ─── Price helpers ────────────────────────────────────────────────────────────

export function computeUnitPrice(item: CartItem): number {
  const complementAdj = item.complements
    .flatMap((c) => c.selectedOptions)
    .filter((o) => o.increment)
    .reduce((sum, o) => sum + o.price, 0)
  const slotAdj = item.comboSlots
    .flatMap((s) => s.complements)
    .flatMap((c) => c.selectedOptions)
    .filter((o) => o.increment)
    .reduce((sum, o) => sum + o.price, 0)
  return item.menuPrice + complementAdj + slotAdj
}

export function computeItemTotal(item: CartItem): number {
  return computeUnitPrice(item) * item.quantity
}

export function computeCartTotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + computeItemTotal(i), 0)
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

interface CartState {
  slug: string
  menuId: number | null
  currency: Currency
  items: CartItem[]
}

type CartAction =
  | { type: 'SET_MENU'; slug: string; menuId: number; currency: Currency }
  | { type: 'ADD_ITEM'; item: CartItem }
  | { type: 'REMOVE_ITEM'; uid: string }
  | { type: 'UPDATE_QUANTITY'; uid: string; quantity: number }
  | { type: 'CLEAR' }

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'SET_MENU':
      if (state.slug === action.slug && state.menuId === action.menuId) {
        if (state.currency === action.currency) return state
        return { ...state, currency: action.currency }
      }
      return { slug: action.slug, menuId: action.menuId, currency: action.currency, items: [] }
    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.item] }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((i) => i.uid !== action.uid) }
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items
          .map((i) => (i.uid === action.uid ? { ...i, quantity: action.quantity } : i))
          .filter((i) => i.quantity > 0),
      }
    case 'CLEAR':
      return { ...state, items: [] }
    default:
      return state
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface CartContextValue {
  state: CartState
  currency: Currency
  setMenu: (slug: string, menuId: number, currency: Currency) => void
  addItem: (item: CartItem) => void
  removeItem: (uid: string) => void
  updateQuantity: (uid: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextValue | null>(null)
const STORAGE_KEY = 'foodify_cart_v1'

const initialState: CartState = { slug: '', menuId: null, currency: DEFAULT_CURRENCY, items: [] }

function loadState(): CartState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : initialState
  } catch {
    return initialState
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const totalItems = state.items.reduce((s, i) => s + i.quantity, 0)
  const totalPrice = computeCartTotal(state.items)

  return (
    <CartContext.Provider
      value={{
        state,
        currency: state.currency,
        setMenu: (slug, menuId, currency) => dispatch({ type: 'SET_MENU', slug, menuId, currency }),
        addItem: (item) => dispatch({ type: 'ADD_ITEM', item }),
        removeItem: (uid) => dispatch({ type: 'REMOVE_ITEM', uid }),
        updateQuantity: (uid, quantity) => dispatch({ type: 'UPDATE_QUANTITY', uid, quantity }),
        clearCart: () => dispatch({ type: 'CLEAR' }),
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
