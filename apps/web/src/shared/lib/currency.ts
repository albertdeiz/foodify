export const CURRENCIES = [
  { value: 'EUR', label: 'Euro (€)' },
  { value: 'USD', label: 'Dólar estadounidense ($)' },
  { value: 'GBP', label: 'Libra esterlina (£)' },
  { value: 'MXN', label: 'Peso mexicano' },
  { value: 'COP', label: 'Peso colombiano' },
  { value: 'ARS', label: 'Peso argentino' },
  { value: 'CLP', label: 'Peso chileno' },
  { value: 'PEN', label: 'Sol peruano' },
  { value: 'BRL', label: 'Real brasileño' },
] as const

export type Currency = (typeof CURRENCIES)[number]['value']

export const DEFAULT_CURRENCY: Currency = 'CLP'
