export interface User {
  id: number
  firstName: string
  lastName: string
  email: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface RegisterInput {
  firstName: string
  lastName: string
  email: string
  password: string
}

export interface LoginInput {
  email: string
  password: string
}
