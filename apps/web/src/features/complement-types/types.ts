export interface ProductComplement {
  id: number
  name: string
  price: number
  increment: boolean
  isDisabled: boolean
  linkedProductId: number | null
  productComplementTypeId: number
}

export interface ComplementType {
  id: number
  name: string
  required: boolean
  minSelectable: number
  maxSelectable: number
  workspaceId: number
  productComplements: ProductComplement[]
}

export interface CreateComplementTypeInput {
  name: string
  required: boolean
  minSelectable: number
  maxSelectable: number
}

export interface CreateComplementInput {
  name: string
  price: number
  increment?: boolean
  linkedProductId?: number
}
