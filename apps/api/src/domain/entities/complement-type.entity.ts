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

export type CreateComplementTypeInput = Pick<
  ComplementType,
  'name' | 'required' | 'min_selectable' | 'max_selectable' | 'workspace_id'
>
export type UpdateComplementTypeInput = Partial<
  Pick<ComplementType, 'name' | 'required' | 'min_selectable' | 'max_selectable'>
>

export type CreateComplementInput = {
  name: string
  price: number
  linked_product_id?: number | null
}
export type UpdateComplementInput = Partial<{
  name: string
  price: number
  is_disabled: boolean
  linked_product_id: number | null
}>
