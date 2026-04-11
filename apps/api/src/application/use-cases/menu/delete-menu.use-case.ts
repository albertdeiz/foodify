import type { IMenuRepository } from '../../../domain/repositories/menu.repository'

export class DeleteMenuUseCase {
  constructor(private readonly menuRepository: IMenuRepository) {}

  async execute(id: number): Promise<void> {
    return this.menuRepository.delete(id)
  }
}
