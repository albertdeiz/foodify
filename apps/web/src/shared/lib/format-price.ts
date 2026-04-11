import type { Currency } from './currency'

export function formatPrice(cents: number, currency: Currency): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(cents / 100)
}

export function formatPriceAdjust(cents: number, currency: Currency): string {
  if (cents === 0) return 'Gratis'
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    signDisplay: 'always',
    minimumFractionDigits: 2,
  }).format(cents / 100)
}
