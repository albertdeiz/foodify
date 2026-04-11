import type { IComplementTypeRepository } from '../../../domain/repositories/complement-type.repository'
import type { ProductComplement, CreateComplementInput } from '../../../domain/entities/complement-type.entity'

export class AddComplementUseCase {
  constructor(private readonly complementTypeRepository: IComplementTypeRepository) {}

  async execute(typeId: number, input: CreateComplementInput): Promise<ProductComplement> {
    return this.complementTypeRepository.addComplement(typeId, input)
  }
}
