'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Loader2, CalendarPlus } from 'lucide-react'
import { roomsApi } from '@/lib/api/rooms'
import { reservationsApi } from '@/lib/api/reservations'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/lib/hooks/use-toast'
import type { Room, ReservationFormData } from '@/types'

export default function NewReservationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedRoomId = searchParams.get('roomId') || ''

  const [rooms, setRooms] = useState<Room[]>([])
  const [isLoadingRooms, setIsLoadingRooms] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [roomId, setRoomId] = useState(preselectedRoomId)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')

  useEffect(() => {
    async function fetchRooms() {
      setIsLoadingRooms(true)
      try {
        const response = await roomsApi.getRooms()
        setRooms(response.data.filter((r) => r.isActive))
      } catch {
        console.error('Failed to fetch rooms')
      } finally {
        setIsLoadingRooms(false)
      }
    }
    fetchRooms()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!roomId) {
      toast({
        title: '入力エラー',
        description: '会議室を選択してください',
        variant: 'destructive',
      })
      return
    }
    if (!title.trim()) {
      toast({
        title: '入力エラー',
        description: 'タイトルを入力してください',
        variant: 'destructive',
      })
      return
    }
    if (!startTime || !endTime) {
      toast({
        title: '入力エラー',
        description: '開始時刻と終了時刻を入力してください',
        variant: 'destructive',
      })
      return
    }
    if (new Date(startTime) >= new Date(endTime)) {
      toast({
        title: '入力エラー',
        description: '終了時刻は開始時刻より後にしてください',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    try {
      const data: ReservationFormData = {
        roomId,
        title: title.trim(),
        description: description.trim() || undefined,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        attendees: [],
        equipment: [],
        isRecurring: false,
      }
      await reservationsApi.createReservation(data)
      toast({
        title: '予約完了',
        description: '会議室の予約が作成されました',
      })
      router.push('/reservations')
    } catch {
      toast({
        title: 'エラー',
        description: '予約の作成に失敗しました。もう一度お試しください。',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedRoom = rooms.find((r) => r.id === roomId)

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">新規予約</h1>
          <p className="text-muted-foreground mt-1">
            会議室の予約を作成します
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>予約情報</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="room">会議室 *</Label>
              {isLoadingRooms ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  会議室を読み込み中...
                </div>
              ) : (
                <Select value={roomId} onValueChange={setRoomId}>
                  <SelectTrigger id="room">
                    <SelectValue placeholder="会議室を選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        {room.name} ({room.capacity}名 / {room.location})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {selectedRoom && (
                <p className="text-xs text-muted-foreground">
                  収容人数: {selectedRoom.capacity}名 / {selectedRoom.location} /{' '}
                  {selectedRoom.floor}F
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">タイトル *</Label>
              <Input
                id="title"
                placeholder="例: 週次チームミーティング"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">説明</Label>
              <Input
                id="description"
                placeholder="会議の目的や議題など（任意）"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">開始日時 *</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">終了日時 *</Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <Button
                type="submit"
                variant="luxury"
                size="lg"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    作成中...
                  </>
                ) : (
                  <>
                    <CalendarPlus className="h-4 w-4 mr-2" />
                    予約を作成
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => router.back()}
              >
                キャンセル
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
