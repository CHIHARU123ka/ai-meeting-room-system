'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Users,
  MapPin,
  Building2,
  Calendar,
  Monitor,
  Loader2,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { roomsApi } from '@/lib/api/rooms'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type { Room } from '@/types'

const equipmentTypeLabel: Record<string, string> = {
  projector: 'プロジェクター',
  whiteboard: 'ホワイトボード',
  tv: 'ディスプレイ',
  audio: 'オーディオ',
  video: 'ビデオ',
  other: 'その他',
}

export default function RoomDetailPage() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.id as string

  const [room, setRoom] = useState<Room | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRoom() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await roomsApi.getRoom(roomId)
        setRoom(data)
      } catch {
        setError('会議室の情報を取得できませんでした')
      } finally {
        setIsLoading(false)
      }
    }
    fetchRoom()
  }, [roomId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-muted-foreground">読み込み中...</span>
      </div>
    )
  }

  if (error || !room) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          戻る
        </Button>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <XCircle className="h-12 w-12 text-destructive mb-4" />
            <p className="text-lg font-medium">
              {error || '会議室が見つかりません'}
            </p>
            <Link href="/rooms" className="mt-4">
              <Button variant="outline">会議室一覧に戻る</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{room.name}</h1>
            <Badge variant={room.isActive ? 'success' : 'destructive'}>
              {room.isActive ? '利用可能' : '利用停止'}
            </Badge>
          </div>
          {room.description && (
            <p className="text-muted-foreground mt-1">{room.description}</p>
          )}
        </div>
        <Link href={`/reservations/new?roomId=${room.id}`}>
          <Button variant="luxury" size="lg">
            <Calendar className="h-4 w-4 mr-2" />
            この部屋を予約する
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>基本情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">収容人数</p>
                  <p className="font-semibold">{room.capacity}名</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">場所</p>
                  <p className="font-semibold">{room.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Building2 className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">フロア</p>
                  <p className="font-semibold">{room.floor}F</p>
                </div>
              </div>
            </div>

            {room.hourlyRate !== undefined && (
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">利用料金</p>
                <p className="text-lg font-bold text-primary">
                  {room.hourlyRate.toLocaleString()}円
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    / 時間
                  </span>
                </p>
              </div>
            )}

            <Separator />

            <div>
              <h3 className="font-semibold mb-3">アメニティ</h3>
              {room.amenities.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {room.amenities.map((amenity) => (
                    <Badge key={amenity} variant="info">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  アメニティ情報はありません
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              設備一覧
            </CardTitle>
          </CardHeader>
          <CardContent>
            {room.equipment.length > 0 ? (
              <div className="space-y-3">
                {room.equipment.map((eq) => (
                  <div
                    key={eq.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div>
                      <p className="font-medium text-sm">{eq.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {equipmentTypeLabel[eq.type] || eq.type}
                      </p>
                      {eq.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {eq.description}
                        </p>
                      )}
                    </div>
                    {eq.isWorking ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                設備情報はありません
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
