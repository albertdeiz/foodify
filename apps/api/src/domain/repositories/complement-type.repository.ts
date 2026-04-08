import type {
  ComplementType,
  CreateComplementTypeInput,
  UpdateComplementTypeInput,
  ProductComplement,
  CreateComplementInput,
  UpdateComplementInput,
} from '../entities/complement-type.entity'

export interface IComplementTypeRepository {
  findByWorkspaceId(workspaceId: number): Promise<ComplementType[]>
  findById(id: number): Promise<ComplementType | null>
  create(input: CreateComplementTypeInput): Promise<ComplementType>
  update(id: number, input: UpdateComplementTypeInput): Promise<ComplementType>
  delete(id: number): Promise<void>
  addComplement(typeId: number, input: CreateComplementInput): Promise<ProductComplement>
  updateComplement(complementId: number, input: UpdateComplementInput): Promise<ProductComplement>
  deleteComplement(complementId: number): Promise<void>
}
