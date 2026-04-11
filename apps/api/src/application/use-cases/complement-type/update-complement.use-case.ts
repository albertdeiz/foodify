import type { IComplementTypeRepository } from '../../../domain/repositories/complement-type.repository'
import type { ProductComplement, UpdateComplementInput } from '../../../domain/entities/complement-type.entity'

export class UpdateComplementUseCase {
  constructor(private readonly complementTypeRepository: IComplementTypeRepository) {}

  async execute(complementId: number, input: UpdateComplementInput): Promise<ProductComplement> {
    return this.complementTypeRepository.updateComplement(complementId, input)
  }
}
