import { create } from 'zustand'
import type { Notification } from '@/types'

interface UIState {
  sidebarOpen: boolean
  mobileSidebarOpen: boolean
  theme: 'light' | 'dark' | 'system'
  notifications: Notification[]
  unreadCount: number
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setMobileSidebarOpen: (open: boolean) => void
  toggleMobileSidebar: () => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  addNotification: (notification: Notification) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  mobileSidebarOpen: false,
  theme: 'system',
  notifications: [
    {
      id: '1',
      userId: '1',
      type: 'reminder',
      title: '会議リマインダー',
      message: '14:00から「週次ミーティング」が始まります',
      isRead: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      userId: '1',
      type: 'reservation',
      title: '予約確認',
      message: '会議室Aの予約が確定しました',
      isRead: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: '3',
      userId: '1',
      type: 'system',
      title: 'システム通知',
      message: '新しいAI推薦機能が利用可能になりました',
      isRead: true,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
  unreadCount: 2,

  toggleSidebar: () =>
    set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setSidebarOpen: (open) =>
    set({ sidebarOpen: open }),

  setMobileSidebarOpen: (open) =>
    set({ mobileSidebarOpen: open }),

  toggleMobileSidebar: () =>
    set((state) => ({ mobileSidebarOpen: !state.mobileSidebarOpen })),

  setTheme: (theme) =>
    set({ theme }),

  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + (notification.isRead ? 0 : 1),
    })),

  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    })),

  removeNotification: (id) =>
    set((state) => {
      const notification = state.notifications.find((n) => n.id === id)
      return {
        notifications: state.notifications.filter((n) => n.id !== id),
        unreadCount: notification && !notification.isRead
          ? Math.max(0, state.unreadCount - 1)
          : state.unreadCount,
      }
    }),

  clearNotifications: () =>
    set({ notifications: [], unreadCount: 0 }),
}))
