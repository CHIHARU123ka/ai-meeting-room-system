'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  CalendarPlus,
  Clock,
  MapPin,
  Loader2,
  CalendarX2,
  Filter,
} from 'lucide-react'
import { reservationsApi } from '@/lib/api/reservations'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { toast } from '@/lib/hooks/use-toast'
import { formatDate, formatTime } from '@/lib/utils'
import type { Reservation } from '@/types'

const statusConfig: Record<
  Reservation['status'],
  { label: string; variant: 'success' | 'warning' | 'destructive' | 'secondary' }
> = {
  confirmed: { label: '確定', variant: 'success' },
  pending: { label: '保留中', variant: 'warning' },
  cancelled: { label: 'キャンセル済', variant: 'destructive' },
  completed: { label: '完了', variant: 'secondary' },
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  const fetchReservations = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await reservationsApi.getReservations()
      setReservations(response.data)
    } catch (error) {
      console.error('Failed to fetch reservations:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReservations()
  }, [fetchReservations])

  const handleCancel = async (id: string) => {
    if (!confirm('この予約をキャンセルしてもよろしいですか？')) return
    setCancellingId(id)
    try {
      await reservationsApi.cancelReservation(id)
      setReservations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'cancelled' as const } : r))
      )
      toast({
        title: 'キャンセル完了',
        description: '予約をキャンセルしました',
      })
    } catch {
      toast({
        title: 'エラー',
        description: 'キャンセルに失敗しました',
        variant: 'destructive',
      })
    } finally {
      setCancellingId(null)
    }
  }

  const filtered =
    statusFilter === 'all'
      ? reservations
      : reservations.filter((r) => r.status === statusFilter)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">予約一覧</h1>
          <p className="text-muted-foreground mt-1">
            会議室の予約状況を管理できます
          </p>
        </div>
        <Link href="/reservations/new">
          <Button variant="luxury" size="lg">
            <CalendarPlus className="h-4 w-4 mr-2" />
            新規予約
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <div className="space-y-1">
              <Label>ステータス</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="すべて" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="confirmed">確定</SelectItem>
                  <SelectItem value="pending">保留中</SelectItem>
                  <SelectItem value="cancelled">キャンセル済</SelectItem>
                  <SelectItem value="completed">完了</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-3 text-muted-foreground">読み込み中...</span>
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <CalendarX2 className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">予約がありません</p>
            <p className="text-muted-foreground mt-1">
              新しい予約を作成しましょう
            </p>
            <Link href="/reservations/new" className="mt-4">
              <Button variant="outline">
                <CalendarPlus className="h-4 w-4 mr-2" />
                新規予約を作成
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((reservation) => {
            const config = statusConfig[reservation.status]
            return (
              <Card key={reservation.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">
                          {reservation.title}
                        </h3>
                        <Badge variant={config.variant}>{config.label}</Badge>
                        {reservation.isRecurring && (
                          <Badge variant="info">定期</Badge>
                        )}
                      </div>

                      {reservation.description && (
                        <p className="text-sm text-muted-foreground">
                          {reservation.description}
                        </p>
                      )}

                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4" />
                          {reservation.room.name}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4" />
                          {formatDate(reservation.startTime)}{' '}
                          {formatTime(reservation.startTime)} -{' '}
                          {formatTime(reservation.endTime)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4 shrink-0">
                      {(reservation.status === 'confirmed' ||
                        reservation.status === 'pending') && (
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={cancellingId === reservation.id}
                          onClick={() => handleCancel(reservation.id)}
                        >
                          {cancellingId === reservation.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'キャンセル'
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
