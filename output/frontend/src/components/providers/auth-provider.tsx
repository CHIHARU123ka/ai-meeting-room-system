'use client'

import * as React from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'

interface AuthContextType {
  user: ReturnType<typeof useAuthStore>['user']
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = React.createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, initialize } = useAuthStore()

  React.useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  return React.useContext(AuthContext)
}
