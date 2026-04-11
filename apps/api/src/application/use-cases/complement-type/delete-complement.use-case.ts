import type { IComplementTypeRepository } from '../../../domain/repositories/complement-type.repository'

export class DeleteComplementUseCase {
  constructor(private readonly complementTypeRepository: IComplementTypeRepository) {}

  async execute(complementId: number): Promise<void> {
    return this.complementTypeRepository.deleteComplement(complementId)
  }
}
