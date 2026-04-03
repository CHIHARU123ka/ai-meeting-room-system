'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/auth-store'
import { authApi } from '@/lib/api/auth'
import { toast } from '@/lib/hooks/use-toast'
import type { LoginCredentials, RegisterData } from '@/types'

export function useAuth() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, login: storeLogin, logout: storeLogout } = useAuthStore()

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      const response = await authApi.login(credentials)
      storeLogin(response.user, response.token)
      toast({
        title: 'ログイン成功',
        description: `ようこそ、${response.user.name}さん`,
      })
      router.push('/dashboard')
      return response
    } catch (error: any) {
      toast({
        title: 'ログインエラー',
        description: error.message || 'ログインに失敗しました',
        variant: 'destructive',
      })
      throw error
    }
  }, [storeLogin, router])

  const register = useCallback(async (data: RegisterData) => {
    try {
      const response = await authApi.register(data)
      storeLogin(response.user, response.token)
      toast({
        title: '登録完了',
        description: 'アカウントが作成されました',
      })
      router.push('/dashboard')
      return response
    } catch (error: any) {
      toast({
        title: '登録エラー',
        description: error.message || '登録に失敗しました',
        variant: 'destructive',
      })
      throw error
    }
  }, [storeLogin, router])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      // ignore logout API errors
    }
    storeLogout()
    toast({
      title: 'ログアウト',
      description: 'ログアウトしました',
    })
    router.push('/')
  }, [storeLogout, router])

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
  }
}
