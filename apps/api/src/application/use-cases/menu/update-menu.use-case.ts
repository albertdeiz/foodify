import type { IMenuRepository } from '../../../domain/repositories/menu.repository'
import type { Menu, UpdateMenuInput } from '../../../domain/entities/menu.entity'

export class UpdateMenuUseCase {
  constructor(private readonly menuRepository: IMenuRepository) {}

  async execute(id: number, input: UpdateMenuInput): Promise<Menu> {
    return this.menuRepository.update(id, input)
  }
}
