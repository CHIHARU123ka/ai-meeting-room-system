承知しました。設計書に基づいてNext.js 15 + TypeScript + Tailwind CSS + shadcn/uiでTodoリストアプリを完全実装いたします。

=== package.json ===
```json
{
  "name": "todo-app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "next": "15.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "lucide-react": "^0.294.0",
    "@radix-ui/react-checkbox": "^1.0.4",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-toast": "^1.1.5",
    "framer-motion": "^10.16.0",
    "zustand": "^4.4.0",
    "uuid": "^9.0.0",
    "date-fns": "^2.30.0",
    "react-hook-form": "^7.47.0",
    "@hookform/resolvers": "^3.3.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@types/uuid": "^9.0.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "15.0.0",
    "prettier": "^3.0.0",
    "vitest": "^0.34.0",
    "@vitejs/plugin-react": "^4.0.0",
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^6.0.0",
    "jsdom": "^22.0.0"
  }
}
```

=== tailwind.config.js ===
```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        glass: {
          light: "rgba(255, 255, 255, 0.1)",
          dark: "rgba(0, 0, 0, 0.1)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
        "glass-shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
        "glass-shimmer": "glass-shimmer 2s infinite",
      },
      backdropBlur: {
        xs: "2px",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "glass-gradient": "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
        "glass-gradient-dark": "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

=== app/globals.css ===
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 84% 4.9%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 84% 4.9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.75rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 84% 4.9%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 94.1%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}

@layer utilities {
  .glass {
    @apply backdrop-blur-md bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10;
  }
  
  .glass-strong {
    @apply backdrop-blur-lg bg-white/20 dark:bg-black/20 border border-white/30 dark:border-white/20;
  }
  
  .glass-subtle {
    @apply backdrop-blur-sm bg-white/5 dark:bg-black/5 border border-white/10 dark:border-white/5;
  }
  
  .luxury-gradient {
    @apply bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700;
  }
  
  .luxury-text {
    @apply bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent;
  }
  
  .animate-glass-shimmer {
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    background-size: 200% 100%;
    animation: glass-shimmer 2s infinite;
  }
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  @apply bg-transparent;
}

::-webkit-scrollbar-thumb {
  @apply bg-white/20 dark:bg-white/10 rounded-full;
}

::-webkit-scrollbar-thumb:hover {
  @apply bg-white/30 dark:bg-white/20;
}

/* Smooth transitions */
* {
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

/* Focus styles */
.focus-visible {
  @apply outline-none ring-2 ring-primary ring-offset-2 ring-offset-background;
}

/* Glass morphism effects */
.glass-morphism {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.dark .glass-morphism {
  background: rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Luxury animations */
@keyframes luxury-pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.02);
  }
}

.luxury-pulse {
  animation: luxury-pulse 2s ease-in-out infinite;
}

/* Responsive typography */
.text-responsive-xl {
  @apply text-2xl md:text-3xl lg:text-4xl xl:text-5xl;
}

.text-responsive-lg {
  @apply text-xl md:text-2xl lg:text-3xl;
}

.text-responsive-md {
  @apply text-lg md:text-xl lg:text-2xl;
}

/* Luxury spacing */
.luxury-spacing {
  @apply space-y-8 md:space-y-12 lg:space-y-16;
}

.luxury-padding {
  @apply p-6 md:p-8 lg:p-12 xl:p-16;
}

.luxury-margin {
  @apply m-6 md:m-8 lg:m-12 xl:m-16;
}
```

=== app/layout.tsx ===
```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { ErrorBoundary } from '@/components/common/error-boundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Luxury Todo - Premium Task Management',
  description: 'A luxurious and elegant todo application with glass morphism design',
  keywords: ['todo', 'task management', 'productivity', 'luxury', 'glass morphism'],
  authors: [{ name: 'Luxury Todo Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={inter.className}>
        <ErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
              <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
              <div className="relative">
                {children}
              </div>
            </div>
            <Toaster />
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
```

=== app/page.tsx ===
```tsx
'use client'

import { TodoPage } from '@/components/pages/todo-page'

export default function Home() {
  return <TodoPage />
}
```

=== lib/utils.ts ===
```ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return 'たった今'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes}分前`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours}時間前`
  } else {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days}日前`
  }
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function getContrastColor(hexColor: string): string {
  // Remove # if present
  const color = hexColor.replace('#', '')
  
  // Convert to RGB
  const r = parseInt(color.substring(0, 2), 16)
  const g = parseInt(color.substring(2, 4), 16)
  const b = parseInt(color.substring(4, 6), 16)
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  
  return luminance > 0.5 ? '#000000' : '#ffffff'
}

export function hexToRgba(hex: string, alpha: number): string {
  const color = hex.replace('#', '')
  const r = parseInt(color.substring(0, 2), 16)
  const g = parseInt(color.substring(2, 4), 16)
  const b = parseInt(color.substring(4, 6), 16)
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function getRandomColor(): string {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

export function sortByProperty<T>(
  array: T[],
  property: keyof T,
  direction: 'asc' | 'desc' = 'asc'
): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[property]
    const bVal = b[property]
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1
    if (aVal > bVal) return direction === 'asc' ? 1 : -1
    return 0
  })
}

export function groupBy<T>(
  array: T[],
  keyFn: (item: T) => string
): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const key = keyFn(item)
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(item)
    return groups
  }, {} as Record<string, T[]>)
}

export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as unknown as T
  if (typeof obj === 'object') {
    const clonedObj = {} as { [key: string]: any }
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj as T
  }
  return obj
}

export function isEqual<T>(a: T, b: T): boolean {
  if (a === b) return true
  if (a == null || b == null) return false
  if (typeof a !== typeof b) return false
  
  if (typeof a === 'object') {
    const keysA = Object.keys(a as any)
    const keysB = Object.keys(b as any)
    
    if (keysA.length !== keysB.length) return false
    
    for (const key of keysA) {
      if (!keysB.includes(key)) return false
      if (!isEqual((a as any)[key], (b as any)[key])) return false
    }
    
    return true
  }
  
  return false
}
```

=== types/index.ts ===
```ts
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
```

=== store/todo-store.ts ===
```ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Todo, TodoFilter, TodoStats, TodoFormData } from '@/types'
import { generateId } from '@/lib/utils'

interface TodoState {
  todos: Todo[]
  filter: TodoFilter
  stats: TodoStats
  selectedTodoId?: string
  
  // Actions
  addTodo: (data: TodoFormData) => void
  updateTodo: (id: string, updates: Partial<Todo>) => void
  deleteTodo: (id: string) => void
  toggleTodo: (id: string) => void
  bulkDelete: (ids: string[]) => void
  bulkComplete: (ids: string[]) => void
  clearCompleted: () => void
  reorderTodos: (sourceIndex: number, destinationIndex: number) => void
  
  // Filter actions
  setFilter: (filter: Partial<TodoFilter>) => void
  resetFilter: () => void
  
  // Selection actions