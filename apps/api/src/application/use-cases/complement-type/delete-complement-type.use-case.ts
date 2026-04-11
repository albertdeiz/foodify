import type { IComplementTypeRepository } from '../../../domain/repositories/complement-type.repository'

export class DeleteComplementTypeUseCase {
  constructor(private readonly complementTypeRepository: IComplementTypeRepository) {}

  async execute(id: number): Promise<void> {
    return this.complementTypeRepository.delete(id)
  }
}
