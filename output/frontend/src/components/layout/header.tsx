'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  Menu,
  Moon,
  Sun,
  LogOut,
  User,
  Settings,
  ChevronDown,
  Search,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/lib/hooks/use-auth'
import { useUIStore } from '@/lib/stores/ui-store'
import { getInitials, getRelativeTime } from '@/lib/utils'

const pageTitles: Record<string, string> = {
  '/dashboard': 'ダッシュボード',
  '/rooms': '会議室',
  '/reservations': '予約管理',
  '/analytics': '分析',
  '/admin': '管理者設定',
}

function getPageTitle(pathname: string): string {
  for (const [path, title] of Object.entries(pageTitles)) {
    if (pathname === path || pathname.startsWith(path + '/')) {
      return title
    }
  }
  return 'ダッシュボード'
}

export function Header() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const {
    toggleSidebar,
    toggleMobileSidebar,
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  } = useUIStore()
  const [showNotifications, setShowNotifications] = React.useState(false)
  const [showUserMenu, setShowUserMenu] = React.useState(false)
  const notifRef = React.useRef<HTMLDivElement>(null)
  const userRef = React.useRef<HTMLDivElement>(null)

  const pageTitle = getPageTitle(pathname)

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b glass-card">
      <div className="flex h-16 items-center px-4 gap-4">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMobileSidebar}
          className="shrink-0 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Desktop sidebar toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="shrink-0 hidden md:flex"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Page title */}
        <h1 className="text-lg font-semibold hidden sm:block">{pageTitle}</h1>

        {/* Search bar (decorative) */}
        <div className="flex-1 max-w-md mx-auto hidden lg:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="会議室・予約を検索..."
              className="pl-10 h-9 bg-muted/50"
              readOnly
            />
          </div>
        </div>

        <div className="flex-1 lg:hidden" />

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">テーマ切替</span>
        </Button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-80 rounded-xl glass-card border shadow-luxury overflow-hidden"
              >
                <div className="flex items-center justify-between p-4 border-b border-border/50">
                  <h3 className="font-semibold text-sm">通知</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-primary hover:underline"
                    >
                      すべて既読にする
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground text-sm">
                      通知はありません
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <button
                        key={notif.id}
                        onClick={() => markAsRead(notif.id)}
                        className={`w-full text-left p-4 hover:bg-accent/50 transition-colors border-b border-border/30 last:border-0 ${
                          !notif.isRead ? 'bg-primary/5' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                              !notif.isRead ? 'bg-primary' : 'bg-transparent'
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{notif.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                              {notif.message}
                            </p>
                            <p className="text-xs text-muted-foreground/70 mt-1">
                              {getRelativeTime(notif.createdAt)}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Menu */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-accent/50 transition-colors"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar} alt={user?.name} />
              <AvatarFallback className="bg-primary/20 text-primary text-xs">
                {user?.name ? getInitials(user.name) : 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium leading-none">{user?.name || 'ゲスト'}</p>
              <p className="text-xs text-muted-foreground">{user?.department || ''}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:block" />
          </button>

          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-56 rounded-xl glass-card border shadow-luxury overflow-hidden"
              >
                <div className="p-3 border-b border-border/50">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <div className="p-1">
                  <Link
                    href="/dashboard"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent/50 transition-colors"
                  >
                    <User className="h-4 w-4" />
                    プロフィール
                  </Link>
                  <Link
                    href="/dashboard"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent/50 transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    設定
                  </Link>
                  <Separator className="my-1" />
                  <button
                    onClick={() => {
                      setShowUserMenu(false)
                      logout()
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-destructive/10 text-destructive transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    ログアウト
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
