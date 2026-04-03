import { apiClient } from './client'
import type { Room, ApiResponse, PaginatedResponse, FilterOptions } from '@/types'

const demoRooms: Room[] = [
  {
    id: 'room-1',
    name: 'イノベーションルーム A',
    description: '最新のAV設備を備えた大会議室。プレゼンテーションやワークショップに最適です。',
    capacity: 20,
    location: '本社ビル 10F',
    floor: 10,
    equipment: [
      { id: 'eq-1', name: '4Kプロジェクター', type: 'projector', isWorking: true },
      { id: 'eq-2', name: 'スマートホワイトボード', type: 'whiteboard', isWorking: true },
      { id: 'eq-3', name: 'ビデオ会議システム', type: 'video', isWorking: true },
    ],
    amenities: ['Wi-Fi', 'ドリンクサービス', '電源コンセント', 'ウェブカメラ'],
    images: [],
    isActive: true,
    hourlyRate: 5000,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'room-2',
    name: 'クリエイティブスペース B',
    description: 'ブレインストーミングに最適な、カジュアルで創造的な空間。',
    capacity: 8,
    location: '本社ビル 8F',
    floor: 8,
    equipment: [
      { id: 'eq-4', name: 'ホワイトボード', type: 'whiteboard', isWorking: true },
      { id: 'eq-5', name: 'TVモニター', type: 'tv', isWorking: true },
    ],
    amenities: ['Wi-Fi', '電源コンセント', 'スナック'],
    images: [],
    isActive: true,
    hourlyRate: 2000,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'room-3',
    name: 'エグゼクティブルーム C',
    description: '重要な意思決定会議のための静粛で格式高い会議室。',
    capacity: 12,
    location: '本社ビル 15F',
    floor: 15,
    equipment: [
      { id: 'eq-6', name: '4Kディスプレイ', type: 'tv', isWorking: true },
      { id: 'eq-7', name: 'サウンドシステム', type: 'audio', isWorking: true },
      { id: 'eq-8', name: 'ビデオ会議システム', type: 'video', isWorking: true },
    ],
    amenities: ['Wi-Fi', 'ドリンクサービス', '電源コンセント', 'ケータリング対応'],
    images: [],
    isActive: true,
    hourlyRate: 8000,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'room-4',
    name: 'ミーティングポッド D',
    description: '1on1やクイックミーティング向けのコンパクトスペース。',
    capacity: 4,
    location: '本社ビル 5F',
    floor: 5,
    equipment: [
      { id: 'eq-9', name: 'モニター', type: 'tv', isWorking: true },
    ],
    amenities: ['Wi-Fi', '電源コンセント'],
    images: [],
    isActive: true,
    hourlyRate: 1000,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'room-5',
    name: 'セミナーホール E',
    description: '大規模プレゼンテーションやセミナー向けの大ホール。',
    capacity: 50,
    location: '本社ビル 1F',
    floor: 1,
    equipment: [
      { id: 'eq-10', name: '大型プロジェクター', type: 'projector', isWorking: true },
      { id: 'eq-11', name: 'マイクシステム', type: 'audio', isWorking: true },
      { id: 'eq-12', name: '録画システム', type: 'video', isWorking: true },
    ],
    amenities: ['Wi-Fi', '電源コンセント', 'ステージ', '照明制御'],
    images: [],
    isActive: true,
    hourlyRate: 15000,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'room-6',
    name: 'フォーカスルーム F',
    description: '集中作業やオンライン会議のための個室ブース。',
    capacity: 2,
    location: '本社ビル 7F',
    floor: 7,
    equipment: [
      { id: 'eq-13', name: 'モニター', type: 'tv', isWorking: true },
      { id: 'eq-14', name: 'ウェブカメラ', type: 'video', isWorking: true },
    ],
    amenities: ['Wi-Fi', '電源コンセント', '防音'],
    images: [],
    isActive: true,
    hourlyRate: 500,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
]

export const roomsApi = {
  getRooms: async (filters?: FilterOptions): Promise<PaginatedResponse<Room>> => {
    try {
      const params: Record<string, string | number | boolean | undefined> = {}
      if (filters?.search) params.search = filters.search
      if (filters?.capacity) params.capacity = filters.capacity
      if (filters?.floor) params.floor = filters.floor
      const response = await apiClient.get<PaginatedResponse<Room>>('/rooms', { params })
      return response
    } catch {
      let filtered = [...demoRooms]
      if (filters?.search) {
        const q = filters.search.toLowerCase()
        filtered = filtered.filter(
          (r) => r.name.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q)
        )
      }
      if (filters?.capacity) {
        filtered = filtered.filter((r) => r.capacity >= filters.capacity!)
      }
      if (filters?.floor) {
        filtered = filtered.filter((r) => r.floor === filters.floor)
      }
      return {
        data: filtered,
        pagination: { page: 1, limit: 20, total: filtered.length, totalPages: 1 },
      }
    }
  },

  getRoom: async (id: string): Promise<Room> => {
    try {
      const response = await apiClient.get<ApiResponse<Room>>(`/rooms/${id}`)
      return response.data
    } catch {
      const room = demoRooms.find((r) => r.id === id)
      if (!room) throw new Error('Room not found')
      return room
    }
  },

  createRoom: async (data: Partial<Room>): Promise<Room> => {
    const response = await apiClient.post<ApiResponse<Room>>('/rooms', data)
    return response.data
  },

  updateRoom: async (id: string, data: Partial<Room>): Promise<Room> => {
    const response = await apiClient.put<ApiResponse<Room>>(`/rooms/${id}`, data)
    return response.data
  },

  deleteRoom: async (id: string): Promise<void> => {
    await apiClient.delete(`/rooms/${id}`)
  },
}
