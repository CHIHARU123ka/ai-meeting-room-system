'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  DoorOpen,
  CalendarDays,
  BarChart3,
  Shield,
  Sparkles,
  ChevronLeft,
  LogOut,
  X,
} from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'
import { useUIStore } from '@/lib/stores/ui-store'
import { useAuth } from '@/lib/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const navItems = [
  {
    title: 'ダッシュボード',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: '会議室',
    href: '/rooms',
    icon: DoorOpen,
  },
  {
    title: '予約',
    href: '/reservations',
    icon: CalendarDays,
  },
  {
    title: '分析',
    href: '/analytics',
    icon: BarChart3,
  },
]

const adminItems = [
  {
    title: '管理者',
    href: '/admin',
    icon: Shield,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarOpen, mobileSidebarOpen, toggleSidebar, setMobileSidebarOpen } = useUIStore()
  const { user, logout } = useAuth()
  const isAdmin = user?.role === 'admin'

  // Close mobile sidebar on route change
  React.useEffect(() => {
    setMobileSidebarOpen(false)
  }, [pathname, setMobileSidebarOpen])

  const renderNavItem = (
    item: { title: string; href: string; icon: React.ElementType },
    isExpanded: boolean,
    layoutIdPrefix: string
  ) => {
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
    const linkEl = (
      <Link
        href={item.href}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 relative',
          isActive
            ? 'bg-primary/15 text-primary shadow-sm'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
        )}
      >
        <item.icon className={cn('h-5 w-5 shrink-0', isActive && 'text-primary')} />
        <AnimatePresence>
          {isExpanded && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden whitespace-nowrap"
            >
              {item.title}
            </motion.span>
          )}
        </AnimatePresence>
        {isActive && (
          <motion.div
            layoutId={`${layoutIdPrefix}-activeNav`}
            className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          />
        )}
      </Link>
    )

    if (!isExpanded) {
      return (
        <Tooltip key={item.href}>
          <TooltipTrigger asChild>{linkEl}</TooltipTrigger>
          <TooltipContent side="right">{item.title}</TooltipContent>
        </Tooltip>
      )
    }

    return <React.Fragment key={item.href}>{linkEl}</React.Fragment>
  }

  const sidebarContent = (isMobile: boolean) => {
    const isExpanded = isMobile ? true : sidebarOpen

    return (
      <>
        {/* Logo area */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-border/50">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20 shrink-0">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden whitespace-nowrap flex-1"
              >
                <h2 className="font-bold text-sm">AI Meeting Room</h2>
                <p className="text-xs text-muted-foreground">管理システム</p>
              </motion.div>
            )}
          </AnimatePresence>
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileSidebarOpen(false)}
              className="ml-auto shrink-0"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) =>
            renderNavItem(item, isExpanded, isMobile ? 'mobile' : 'desktop')
          )}

          {isAdmin && (
            <>
              <div className="pt-4 pb-2">
                {isExpanded && (
                  <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    管理
                  </p>
                )}
              </div>
              {adminItems.map((item) =>
                renderNavItem(item, isExpanded, isMobile ? 'mobile' : 'desktop')
              )}
            </>
          )}
        </nav>

        {/* User info at bottom */}
        <div className="border-t border-border/50 p-3 space-y-2">
          {user && (
            <div
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2',
                isExpanded ? '' : 'justify-center'
              )}
            >
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-primary/20 text-primary text-xs">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden whitespace-nowrap flex-1 min-w-0"
                  >
                    <p className="text-sm font-medium leading-none truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {user.department}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
              {isExpanded && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={logout}
                      className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">ログアウト</TooltipContent>
                </Tooltip>
              )}
            </div>
          )}

          {!isMobile && (
            <>
              <Separator className="my-1" />
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSidebar}
                className="w-full justify-center"
              >
                <ChevronLeft
                  className={cn(
                    'h-4 w-4 transition-transform duration-200',
                    !sidebarOpen && 'rotate-180'
                  )}
                />
                {sidebarOpen && <span className="ml-2 text-xs">折りたたむ</span>}
              </Button>
            </>
          )}
        </div>
      </>
    )
  }

  return (
    <TooltipProvider delayDuration={0}>
      {/* Desktop sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 256 : 72 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="relative hidden md:flex flex-col border-r glass-card h-[calc(100vh-4rem)] overflow-hidden"
      >
        {sidebarContent(false)}
      </motion.aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="fixed inset-y-0 left-0 z-50 w-[280px] flex flex-col border-r glass-card bg-background md:hidden"
            >
              {sidebarContent(true)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </TooltipProvider>
  )
}
