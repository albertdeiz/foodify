export interface User {
  id: number
  first_name: string
  last_name: string
  email: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface RegisterInput {
  first_name: string
  last_name: string
  email: string
  password: string
}

export interface LoginInput {
  email: string
  password: string
}
