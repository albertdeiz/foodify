import type { IComplementTypeRepository } from '../../../domain/repositories/complement-type.repository'
import type { ComplementType } from '../../../domain/entities/complement-type.entity'

export class GetComplementTypesUseCase {
  constructor(private readonly complementTypeRepository: IComplementTypeRepository) {}

  async execute(workspaceId: number): Promise<ComplementType[]> {
    return this.complementTypeRepository.findByWorkspaceId(workspaceId)
  }
}
