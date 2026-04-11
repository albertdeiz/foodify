import type { IComplementTypeRepository } from '../../../domain/repositories/complement-type.repository'
import type { ComplementType, UpdateComplementTypeInput } from '../../../domain/entities/complement-type.entity'

export class UpdateComplementTypeUseCase {
  constructor(private readonly complementTypeRepository: IComplementTypeRepository) {}

  async execute(id: number, input: UpdateComplementTypeInput): Promise<ComplementType> {
    return this.complementTypeRepository.update(id, input)
  }
}
