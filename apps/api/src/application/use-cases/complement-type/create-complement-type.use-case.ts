import type { IComplementTypeRepository } from '../../../domain/repositories/complement-type.repository'
import type { ComplementType, CreateComplementTypeInput } from '../../../domain/entities/complement-type.entity'

export class CreateComplementTypeUseCase {
  constructor(private readonly complementTypeRepository: IComplementTypeRepository) {}

  async execute(input: CreateComplementTypeInput): Promise<ComplementType> {
    return this.complementTypeRepository.create(input)
  }
}
