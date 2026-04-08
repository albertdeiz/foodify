import bcrypt from 'bcryptjs'
import type { IUserRepository } from '../../../domain/repositories/user.repository'
import type { User } from '../../../domain/entities/user.entity'

interface RegisterInput {
  first_name: string
  last_name: string
  email: string
  password: string
}

export class RegisterUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: RegisterInput): Promise<Omit<User, 'password'>> {
    const existing = await this.userRepository.findByEmail(input.email)
    if (existing) throw new Error('Email already in use')

    const hashed = await bcrypt.hash(input.password, 10)
    const user = await this.userRepository.create({ ...input, password: hashed })

    const { password: _, ...safeUser } = user
    return safeUser
  }
}
