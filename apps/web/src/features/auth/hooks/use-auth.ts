import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../api/auth.api'
import { useAuth } from '../context/auth.context'
import type { LoginInput, RegisterInput } from '../types'

export function useRegister() {
  const { login } = useAuth()
  const navigate = useNavigate()
  return useMutation({
    mutationFn: (input: RegisterInput) => authApi.register(input),
    onSuccess: ({ token, user }) => {
      login(token, user)
      navigate('/workspaces')
    },
  })
}

export function useLogin() {
  const { login } = useAuth()
  const navigate = useNavigate()
  return useMutation({
    mutationFn: (input: LoginInput) => authApi.login(input),
    onSuccess: ({ token, user }) => {
      login(token, user)
      navigate('/workspaces')
    },
  })
}
