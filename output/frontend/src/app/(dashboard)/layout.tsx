'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/auth-store'
import { AppShell } from '@/components/layout/app-shell'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isAuthenticated, isLoading, initialize } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <AppShell>{children}</AppShell>
}
