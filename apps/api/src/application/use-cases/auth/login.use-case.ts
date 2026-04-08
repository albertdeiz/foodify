import bcrypt from 'bcryptjs'
import type { IUserRepository } from '../../../domain/repositories/user.repository'
import type { User } from '../../../domain/entities/user.entity'

interface LoginInput {
  email: string
  password: string
}

export class LoginUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: LoginInput): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findByEmail(input.email)
    if (!user) throw new Error('Invalid credentials')

    const valid = await bcrypt.compare(input.password, user.password)
    if (!valid) throw new Error('Invalid credentials')

    const { password: _, ...safeUser } = user
    return safeUser
  }
}
