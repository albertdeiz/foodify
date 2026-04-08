export interface ProductComplement {
  id: number
  name: string
  price: number
  increment: boolean
  is_disabled: boolean
  linked_product_id: number | null
  product_complement_type_id: number
}

export interface ComplementType {
  id: number
  name: string
  required: boolean
  min_selectable: number
  max_selectable: number
  workspace_id: number
  product_complements: ProductComplement[]
}

export interface CreateComplementTypeInput {
  name: string
  required: boolean
  min_selectable: number
  max_selectable: number
}

export interface CreateComplementInput {
  name: string
  price: number
  increment?: boolean
  linked_product_id?: number
}
