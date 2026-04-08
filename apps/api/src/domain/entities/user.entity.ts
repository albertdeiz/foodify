export interface User {
  id: number
  first_name: string
  last_name: string
  email: string
  password: string
  created_at: Date
  updated_at: Date
}

export type CreateUserInput = Pick<User, 'first_name' | 'last_name' | 'email' | 'password'>
