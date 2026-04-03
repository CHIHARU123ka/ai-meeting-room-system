import { apiClient } from './client'
import type { Reservation, ReservationFormData, ApiResponse, PaginatedResponse } from '@/types'

const demoUser = {
  id: 'demo-1',
  email: 'demo@example.com',
  name: '山田 太郎',
  department: 'エンジニアリング',
  role: 'admin' as const,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

const now = new Date()
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

const demoReservations: Reservation[] = [
  {
    id: 'res-1',
    roomId: 'room-1',
    room: {
      id: 'room-1', name: 'イノベーションルーム A', capacity: 20,
      location: '本社ビル 10F', floor: 10, equipment: [], amenities: [],
      images: [], isActive: true, createdAt: '', updatedAt: '',
    },
    userId: 'demo-1',
    user: demoUser,
    title: '週次スプリントレビュー',
    description: 'スプリント成果物のレビューとデモ',
    startTime: new Date(today.getTime() + 14 * 3600000).toISOString(),
    endTime: new Date(today.getTime() + 15 * 3600000).toISOString(),
    attendees: [],
    equipment: ['projector'],
    status: 'confirmed',
    isRecurring: true,
    recurringPattern: { type: 'weekly', interval: 1, daysOfWeek: [3] },
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'res-2',
    roomId: 'room-3',
    room: {
      id: 'room-3', name: 'エグゼクティブルーム C', capacity: 12,
      location: '本社ビル 15F', floor: 15, equipment: [], amenities: [],
      images: [], isActive: true, createdAt: '', updatedAt: '',
    },
    userId: 'demo-1',
    user: demoUser,
    title: '経営戦略会議',
    description: 'Q2の戦略方針について議論',
    startTime: new Date(today.getTime() + 86400000 + 10 * 3600000).toISOString(),
    endTime: new Date(today.getTime() + 86400000 + 12 * 3600000).toISOString(),
    attendees: [],
    equipment: ['tv', 'video'],
    status: 'confirmed',
    isRecurring: false,
    createdAt: '2024-01-20T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z',
  },
  {
    id: 'res-3',
    roomId: 'room-2',
    room: {
      id: 'room-2', name: 'クリエイティブスペース B', capacity: 8,
      location: '本社ビル 8F', floor: 8, equipment: [], amenities: [],
      images: [], isActive: true, createdAt: '', updatedAt: '',
    },
    userId: 'demo-1',
    user: demoUser,
    title: 'デザインレビュー',
    description: '新UIデザインのフィードバック',
    startTime: new Date(today.getTime() + 2 * 86400000 + 15 * 3600000).toISOString(),
    endTime: new Date(today.getTime() + 2 * 86400000 + 16 * 3600000).toISOString(),
    attendees: [],
    equipment: ['whiteboard'],
    status: 'pending',
    isRecurring: false,
    createdAt: '2024-01-22T00:00:00Z',
    updatedAt: '2024-01-22T00:00:00Z',
  },
  {
    id: 'res-4',
    roomId: 'room-4',
    room: {
      id: 'room-4', name: 'ミーティングポッド D', capacity: 4,
      location: '本社ビル 5F', floor: 5, equipment: [], amenities: [],
      images: [], isActive: true, createdAt: '', updatedAt: '',
    },
    userId: 'demo-1',
    user: demoUser,
    title: '1on1 面談',
    description: '月次の1on1ミーティング',
    startTime: new Date(today.getTime() - 86400000 + 11 * 3600000).toISOString(),
    endTime: new Date(today.getTime() - 86400000 + 11.5 * 3600000).toISOString(),
    attendees: [],
    equipment: [],
    status: 'completed',
    isRecurring: false,
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z',
  },
  {
    id: 'res-5',
    roomId: 'room-5',
    room: {
      id: 'room-5', name: 'セミナーホール E', capacity: 50,
      location: '本社ビル 1F', floor: 1, equipment: [], amenities: [],
      images: [], isActive: true, createdAt: '', updatedAt: '',
    },
    userId: 'demo-1',
    user: demoUser,
    title: '技術共有セミナー',
    description: '新しいフレームワークの社内勉強会',
    startTime: new Date(today.getTime() - 2 * 86400000 + 16 * 3600000).toISOString(),
    endTime: new Date(today.getTime() - 2 * 86400000 + 18 * 3600000).toISOString(),
    attendees: [],
    equipment: ['projector', 'audio'],
    status: 'cancelled',
    isRecurring: false,
    createdAt: '2024-01-08T00:00:00Z',
    updatedAt: '2024-01-08T00:00:00Z',
  },
]

export const reservationsApi = {
  getReservations: async (params?: Record<string, string | number | boolean | undefined>): Promise<PaginatedResponse<Reservation>> => {
    try {
      const response = await apiClient.get<PaginatedResponse<Reservation>>('/reservations', { params })
      return response
    } catch {
      return {
        data: demoReservations,
        pagination: { page: 1, limit: 20, total: demoReservations.length, totalPages: 1 },
      }
    }
  },

  getReservation: async (id: string): Promise<Reservation> => {
    try {
      const response = await apiClient.get<ApiResponse<Reservation>>(`/reservations/${id}`)
      return response.data
    } catch {
      const reservation = demoReservations.find((r) => r.id === id)
      if (!reservation) throw new Error('Reservation not found')
      return reservation
    }
  },

  createReservation: async (data: ReservationFormData): Promise<Reservation> => {
    try {
      const response = await apiClient.post<ApiResponse<Reservation>>('/reservations', data)
      return response.data
    } catch {
      const newReservation: Reservation = {
        id: 'res-new-' + Date.now(),
        roomId: data.roomId,
        room: {
          id: data.roomId, name: '会議室', capacity: 10,
          location: '本社ビル', floor: 1, equipment: [], amenities: [],
          images: [], isActive: true, createdAt: '', updatedAt: '',
        },
        userId: 'demo-1',
        user: demoUser,
        title: data.title,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        attendees: [],
        equipment: data.equipment,
        status: 'confirmed',
        isRecurring: data.isRecurring,
        recurringPattern: data.recurringPattern,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      return newReservation
    }
  },

  updateReservation: async (id: string, data: Partial<ReservationFormData>): Promise<Reservation> => {
    const response = await apiClient.put<ApiResponse<Reservation>>(`/reservations/${id}`, data)
    return response.data
  },

  cancelReservation: async (id: string): Promise<Reservation> => {
    try {
      const response = await apiClient.patch<ApiResponse<Reservation>>(`/reservations/${id}/cancel`)
      return response.data
    } catch {
      const reservation = demoReservations.find((r) => r.id === id)
      if (reservation) {
        return { ...reservation, status: 'cancelled' }
      }
      throw new Error('Reservation not found')
    }
  },
}
