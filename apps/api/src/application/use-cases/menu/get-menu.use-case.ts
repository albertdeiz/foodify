import type { IMenuRepository } from '../../../domain/repositories/menu.repository'
import type { MenuWithContent } from '../../../domain/entities/menu.entity'

export class GetMenuUseCase {
  constructor(private readonly menuRepository: IMenuRepository) {}

  async execute(id: number): Promise<MenuWithContent | null> {
    return this.menuRepository.findByIdWithContent(id)
  }
}
