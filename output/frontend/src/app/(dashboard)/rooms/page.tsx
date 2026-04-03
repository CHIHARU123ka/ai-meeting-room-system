'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Search, Users, MapPin, Building2, Loader2 } from 'lucide-react'
import { roomsApi } from '@/lib/api/rooms'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import type { Room, FilterOptions } from '@/types'

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [capacityFilter, setCapacityFilter] = useState<string>('')
  const [floorFilter, setFloorFilter] = useState<string>('')

  const fetchRooms = useCallback(async () => {
    setIsLoading(true)
    try {
      const filters: FilterOptions = {}
      if (search) filters.search = search
      if (capacityFilter && capacityFilter !== 'all') {
        filters.capacity = parseInt(capacityFilter)
      }
      if (floorFilter && floorFilter !== 'all') {
        filters.floor = parseInt(floorFilter)
      }
      const response = await roomsApi.getRooms(filters)
      setRooms(response.data)
    } catch (error) {
      console.error('Failed to fetch rooms:', error)
    } finally {
      setIsLoading(false)
    }
  }, [search, capacityFilter, floorFilter])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRooms()
    }, 300)
    return () => clearTimeout(timer)
  }, [fetchRooms])

  const floors = [...new Set(rooms.map((r) => r.floor))].sort((a, b) => a - b)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">会議室一覧</h1>
        <p className="text-muted-foreground mt-1">
          利用可能な会議室を検索・閲覧できます
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">キーワード検索</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="会議室名で検索..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>最低収容人数</Label>
              <Select value={capacityFilter} onValueChange={setCapacityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="指定なし" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">指定なし</SelectItem>
                  <SelectItem value="2">2人以上</SelectItem>
                  <SelectItem value="4">4人以上</SelectItem>
                  <SelectItem value="8">8人以上</SelectItem>
                  <SelectItem value="12">12人以上</SelectItem>
                  <SelectItem value="20">20人以上</SelectItem>
                  <SelectItem value="50">50人以上</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>フロア</Label>
              <Select value={floorFilter} onValueChange={setFloorFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="全フロア" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全フロア</SelectItem>
                  {floors.map((floor) => (
                    <SelectItem key={floor} value={String(floor)}>
                      {floor}F
                    </SelectItem>
                  ))}
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
      ) : rooms.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">該当する会議室が見つかりません</p>
            <p className="text-muted-foreground mt-1">
              検索条件を変更してください
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <Link key={room.id} href={`/rooms/${room.id}`}>
              <Card className="h-full hover:shadow-lg transition-shadow duration-200 cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {room.name}
                    </CardTitle>
                    <Badge variant={room.isActive ? 'success' : 'destructive'}>
                      {room.isActive ? '利用可能' : '利用停止'}
                    </Badge>
                  </div>
                  {room.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {room.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {room.capacity}名
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {room.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      {room.floor}F
                    </span>
                  </div>

                  {room.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {room.amenities.slice(0, 4).map((amenity) => (
                        <Badge key={amenity} variant="secondary" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                      {room.amenities.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{room.amenities.length - 4}
                        </Badge>
                      )}
                    </div>
                  )}

                  {room.hourlyRate !== undefined && (
                    <p className="text-sm font-medium text-primary">
                      {room.hourlyRate.toLocaleString()}円 / 時間
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
