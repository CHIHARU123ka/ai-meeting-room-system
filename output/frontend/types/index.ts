export interface Todo {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  category?: string
  tags: string[]
  dueDate?: Date
  createdAt: Date
  updatedAt: Date
  color?: string
}

export interface TodoFilter {
  status: 'all' | 'active' | 'completed'
  priority?: 'low' | 'medium' | 'high'
  category?: string
  tag?: string
  search?: string
  sortBy: 'createdAt' | 'updatedAt' | 'dueDate' | 'priority' | 'title'
  sortOrder: 'asc' | 'desc'
}

export interface TodoStats {
  total: number
  completed: number
  active: number
  overdue: number
  completionRate: number
  todayCompleted: number
  weekCompleted: number
  monthCompleted: number
}

export interface UIState {
  theme: 'light' | 'dark' | 'system'
  sidebarOpen: boolean
  filterPanelOpen: boolean
  selectedTodoId?: string
  isLoading: boolean
  error?: string
  toast?: {
    id: string
    title: string
    description?: string
    type: 'success' | 'error' | 'warning' | 'info'
    duration?: number
  }
}

export interface AppSettings {
  autoSave: boolean
  notifications: boolean
  soundEffects: boolean
  compactMode: boolean
  showCompletedTodos: boolean
  defaultPriority: 'low' | 'medium' | 'high'
  defaultCategory?: string
  language: 'ja' | 'en'
  dateFormat: 'relative' | 'absolute'
  theme: 'light' | 'dark' | 'system'
}

export interface Category {
  id: string
  name: string
  color: string
  icon?: string
  description?: string
  createdAt: Date
}

export interface Tag {
  id: string
  name: string
  color: string
  count: number
}

export interface SearchResult {
  todos: Todo[]
  categories: Category[]
  tags: Tag[]
  totalResults: number
  query: string
}

export interface TodoFormData {
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high'
  category?: string
  tags: string[]
  dueDate?: Date
  color?: string
}

export interface FilterOptions {
  statuses: Array<'all' | 'active' | 'completed'>
  priorities: Array<'low' | 'medium' | 'high'>
  categories: Category[]
  tags: Tag[]
  sortOptions: Array<{
    value: string
    label: string
  }>
}

export interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  metaKey?: boolean
  action: string
  description: string
}

export interface AnimationConfig {
  duration: number
  ease: string
  delay?: number
}

export interface ResponsiveBreakpoint {
  mobile: number
  tablet: number
  desktop: number
  wide: number
}

export interface ThemeColors {
  primary: string
  secondary: string
  accent: string
  background: string
  foreground: string
  muted: string
  border: string
  glass: {
    light: string
    dark: string
  }
}

export interface LocalStorageData {
  todos: Todo[]
  categories: Category[]
  settings: AppSettings
  lastSync: Date
  version: string
}

export interface ExportData {
  todos: Todo[]
  categories: Category[]
  settings: AppSettings
  exportDate: Date
  version: string
  format: 'json' | 'csv' | 'txt'
}

export interface ImportResult {
  success: boolean
  imported: {
    todos: number
    categories: number
  }
  errors: string[]
  warnings: string[]
}

export interface BackupData {
  id: string
  name: string
  data: LocalStorageData
  createdAt: Date
  size: number
  compressed: boolean
}

export interface PerformanceMetrics {
  renderTime: number
  loadTime: number
  memoryUsage: number
  todoCount: number
  lastMeasured: Date
}

export interface AccessibilitySettings {
  highContrast: boolean
  reducedMotion: boolean
  screenReader: boolean
  fontSize: 'small' | 'medium' | 'large'
  focusIndicator: boolean
}

export interface NotificationSettings {
  enabled: boolean
  sound: boolean
  desktop: boolean
  reminders: boolean
  dueDateAlerts: boolean
  completionCelebration: boolean
}

export interface SyncSettings {
  enabled: boolean
  provider: 'local' | 'cloud'
  autoSync: boolean
  syncInterval: number
  lastSync?: Date
  conflictResolution: 'local' | 'remote' | 'merge'
}

export type TodoAction = 
  | { type: 'ADD_TODO'; payload: TodoFormData }
  | { type: 'UPDATE_TODO'; payload: { id: string; updates: Partial<Todo> } }
  | { type: 'DELETE_TODO'; payload: string }
  | { type: 'TOGGLE_TODO'; payload: string }
  | { type: 'BULK_DELETE'; payload: string[] }
  | { type: 'BULK_COMPLETE'; payload: string[] }
  | { type: 'REORDER_TODOS'; payload: { sourceIndex: number; destinationIndex: number } }
  | { type: 'SET_FILTER'; payload: Partial<TodoFilter> }
  | { type: 'CLEAR_COMPLETED' }
  | { type: 'IMPORT_TODOS'; payload: Todo[] }
  | { type: 'RESET_TODOS' }

export type UIAction =
  | { type: 'SET_THEME'; payload: 'light' | 'dark' | 'system' }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'TOGGLE_FILTER_PANEL' }
  | { type: 'SELECT_TODO'; payload?: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload?: string }
  | { type: 'SHOW_TOAST'; payload: UIState['toast'] }
  | { type: 'HIDE_TOAST' }
  | { type: 'RESET_UI' }

export type AppAction = TodoAction | UIAction
