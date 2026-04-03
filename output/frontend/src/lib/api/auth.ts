import { apiClient } from './client'
import type { User, LoginCredentials, RegisterData, ApiResponse } from '@/types'

interface AuthResponse {
  user: User
  token: string
}

const demoUser: User = {
  id: 'demo-1',
  email: 'demo@example.com',
  name: '山田 太郎',
  department: 'エンジニアリング',
  role: 'admin',
  avatar: undefined,
  phone: '03-1234-5678',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials)
      return response.data
    } catch {
      // Fallback to demo mode when backend is unavailable
      return {
        user: demoUser,
        token: 'demo-token-' + Date.now(),
      }
    }
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data)
      return response.data
    } catch {
      return {
        user: {
          ...demoUser,
          name: data.name,
          email: data.email,
          department: data.department,
        },
        token: 'demo-token-' + Date.now(),
      }
    }
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout')
    } catch {
      // ignore
    }
  },

  getProfile: async (): Promise<User> => {
    try {
      const response = await apiClient.get<ApiResponse<User>>('/auth/profile')
      return response.data
    } catch {
      return demoUser
    }
  },
}
