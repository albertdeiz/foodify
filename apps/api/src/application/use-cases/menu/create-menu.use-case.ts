import type { IMenuRepository } from '../../../domain/repositories/menu.repository'
import type { Menu } from '../../../domain/entities/menu.entity'

interface CreateMenuInput {
  name: string
  workspace_id: number
}

export class CreateMenuUseCase {
  constructor(private readonly menuRepository: IMenuRepository) {}

  async execute(input: CreateMenuInput): Promise<Menu> {
    return this.menuRepository.create(input)
  }
}
