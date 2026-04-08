import { apiClient } from '@/shared/lib/api-client'
import type { AuthResponse, LoginInput, RegisterInput } from '../types'

export const authApi = {
  register: (input: RegisterInput) =>
    apiClient.post<AuthResponse>('/auth/register', input).then((r) => r.data),
  login: (input: LoginInput) =>
    apiClient.post<AuthResponse>('/auth/login', input).then((r) => r.data),
}
