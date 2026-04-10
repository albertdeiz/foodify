import { apiClient } from '@/shared/lib/api-client'
import type { AuthResponse, LoginInput, RegisterInput, User } from '../types'

// ─── Raw API response types ────────────────────────────────────────────────────

interface ApiUser {
  id: number
  first_name: string
  last_name: string
  email: string
}

interface ApiAuthResponse {
  user: ApiUser
  token: string
}

// ─── Transforms ────────────────────────────────────────────────────────────────

function toUser(r: ApiUser): User {
  return { id: r.id, firstName: r.first_name, lastName: r.last_name, email: r.email }
}

function toAuthResponse(r: ApiAuthResponse): AuthResponse {
  return { user: toUser(r.user), token: r.token }
}

// ─── API ───────────────────────────────────────────────────────────────────────

export const authApi = {
  register: (input: RegisterInput) =>
    apiClient
      .post<ApiAuthResponse>('/auth/register', {
        first_name: input.firstName,
        last_name: input.lastName,
        email: input.email,
        password: input.password,
      })
      .then((r) => toAuthResponse(r.data)),

  login: (input: LoginInput) =>
    apiClient.post<ApiAuthResponse>('/auth/login', input).then((r) => toAuthResponse(r.data)),
}
