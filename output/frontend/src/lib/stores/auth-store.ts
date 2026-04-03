import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  initialize: () => void
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  login: (user: User, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,

      initialize: () => {
        const { token, user } = get()
        if (token && user) {
          set({ isAuthenticated: true, isLoading: false })
        } else {
          set({ isAuthenticated: false, isLoading: false, user: null, token: null })
        }
      },

      setUser: (user) =>
        set({ user, isAuthenticated: !!user }),

      setToken: (token) =>
        set({ token }),

      login: (user, token) =>
        set({ user, token, isAuthenticated: true, isLoading: false }),

      logout: () =>
        set({ user: null, token: null, isAuthenticated: false, isLoading: false }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
)
