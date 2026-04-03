export interface User {
  id: string
  email: string
  name: string
  department: string
  role: 'admin' | 'manager' | 'user'
  avatar?: string
  phone?: string
  createdAt: string
  updatedAt: string
}

export interface Room {
  id: string
  name: string
  description?: string
  capacity: number
  location: string
  floor: number
  equipment: Equipment[]
  amenities: string[]
  images: string[]
  isActive: boolean
  hourlyRate?: number
  createdAt: string
  updatedAt: string
}

export interface Equipment {
  id: string
  name: string
  type: 'projector' | 'whiteboard' | 'tv' | 'audio' | 'video' | 'other'
  description?: string
  isWorking: boolean
  lastMaintenance?: string
}

export interface Reservation {
  id: string
  roomId: string
  room: Room
  userId: string
  user: User
  title: string
  description?: string
  startTime: string
  endTime: string
  attendees: ReservationAttendee[]
  equipment: string[]
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed'
  isRecurring: boolean
  recurringPattern?: RecurringPattern
  createdAt: string
  updatedAt: string
}

export interface ReservationAttendee {
  id: string
  reservationId: string
  userId: string
  user: User
  status: 'invited' | 'accepted' | 'declined' | 'tentative'
  createdAt: string
}

export interface RecurringPattern {
  type: 'daily' | 'weekly' | 'monthly'
  interval: number
  endDate?: string
  daysOfWeek?: number[]
}

export interface AIRecommendation {
  id: string
  userId: string
  type: 'room' | 'time' | 'equipment' | 'attendees'
  title: string
  description: string
  confidence: number
  data: any
  isAccepted?: boolean
  createdAt: string
}

export interface UsageAnalytics {
  roomId: string
  room: Room
  totalReservations: number
  totalHours: number
  utilizationRate: number
  peakHours: { hour: number; count: number }[]
  popularEquipment: { equipment: string; count: number }[]
  averageOccupancy: number
  period: {
    start: string
    end: string
  }
}

export interface Notification {
  id: string
  userId: string
  type: 'reservation' | 'reminder' | 'cancellation' | 'system'
  title: string
  message: string
  isRead: boolean
  data?: any
  createdAt: string
}

export interface Department {
  id: string
  name: string
  description?: string
  managerId?: string
  manager?: User
  memberCount: number
  createdAt: string
  updatedAt: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  errors?: string[]
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface FilterOptions {
  search?: string
  capacity?: number
  floor?: number
  equipment?: string[]
  amenities?: string[]
  availability?: {
    start: string
    end: string
  }
}

export interface ReservationFormData {
  roomId: string
  title: string
  description?: string
  startTime: string
  endTime: string
  attendees: string[]
  equipment: string[]
  isRecurring: boolean
  recurringPattern?: RecurringPattern
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  name: string
  department: string
  phone?: string
}

export interface PasswordResetData {
  email: string
}

export interface PasswordUpdateData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface UserProfile {
  name: string
  email: string
  phone?: string
  department: string
  avatar?: File
}

export interface SystemSettings {
  siteName: string
  siteDescription: string
  allowRegistration: boolean
  requireApproval: boolean
  maxReservationDays: number
  maxReservationHours: number
  businessHours: {
    start: string
    end: string
  }
  workingDays: number[]
  emailNotifications: boolean
  slackIntegration: boolean
  maintenanceMode: boolean
}

export interface DashboardStats {
  totalRooms: number
  totalReservations: number
  activeUsers: number
  utilizationRate: number
  upcomingReservations: Reservation[]
  popularRooms: { room: Room; count: number }[]
  recentActivity: {
    type: 'reservation' | 'cancellation' | 'user_joined'
    message: string
    timestamp: string
    user?: User
  }[]
}

export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  resource?: any
  color?: string
}

export interface TimeSlot {
  start: string
  end: string
  isAvailable: boolean
  reservation?: Reservation
}

export interface RoomAvailability {
  roomId: string
  date: string
  timeSlots: TimeSlot[]
}

export interface SearchFilters {
  query?: string
  dateRange?: {
    start: string
    end: string
  }
  capacity?: {
    min: number
    max: number
  }
  floor?: number[]
  equipment?: string[]
  amenities?: string[]
  priceRange?: {
    min: number
    max: number
  }
}

export interface SortOption {
  field: string
  direction: 'asc' | 'desc'
  label: string
}

export interface TableColumn<T> {
  key: keyof T
  label: string
  sortable?: boolean
  render?: (value: any, item: T) => React.ReactNode
}

export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'date' | 'time'
  placeholder?: string
  required?: boolean
  options?: { value: string; label: string }[]
  validation?: any
}

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}

export interface Theme {
  mode: 'light' | 'dark'
  primaryColor: string
  accentColor: string
}

export interface AppState {
  user: User | null
  isAuthenticated: boolean
  theme: Theme
}
