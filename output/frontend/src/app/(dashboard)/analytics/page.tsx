'use client'

import {
  Building2,
  CalendarCheck,
  Users,
  TrendingUp,
  Clock,
  Award,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

const summaryStats = [
  {
    label: '総会議室数',
    value: '6',
    icon: Building2,
    change: '+1',
    changeLabel: '先月比',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    label: '今月の予約数',
    value: '142',
    icon: CalendarCheck,
    change: '+18%',
    changeLabel: '先月比',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  {
    label: 'アクティブユーザー',
    value: '38',
    icon: Users,
    change: '+5',
    changeLabel: '先月比',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  {
    label: '平均稼働率',
    value: '72%',
    icon: TrendingUp,
    change: '+8%',
    changeLabel: '先月比',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
]

const roomUtilization = [
  { name: 'イノベーションルーム A', rate: 85, color: 'bg-blue-500' },
  { name: 'クリエイティブスペース B', rate: 72, color: 'bg-green-500' },
  { name: 'エグゼクティブルーム C', rate: 68, color: 'bg-purple-500' },
  { name: 'ミーティングポッド D', rate: 91, color: 'bg-orange-500' },
  { name: 'セミナーホール E', rate: 45, color: 'bg-pink-500' },
  { name: 'フォーカスルーム F', rate: 63, color: 'bg-cyan-500' },
]

const topBookers = [
  { name: '山田 太郎', department: 'エンジニアリング', count: 24 },
  { name: '佐藤 花子', department: 'マーケティング', count: 19 },
  { name: '鈴木 一郎', department: 'セールス', count: 16 },
  { name: '田中 美咲', department: 'デザイン', count: 14 },
  { name: '高橋 健太', department: '人事', count: 11 },
]

const peakHours = [
  { hour: '09:00', count: 8 },
  { hour: '10:00', count: 22 },
  { hour: '11:00', count: 18 },
  { hour: '12:00', count: 5 },
  { hour: '13:00', count: 15 },
  { hour: '14:00', count: 28 },
  { hour: '15:00', count: 25 },
  { hour: '16:00', count: 20 },
  { hour: '17:00', count: 12 },
  { hour: '18:00', count: 4 },
]

const maxPeakCount = Math.max(...peakHours.map((h) => h.count))

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">分析ダッシュボード</h1>
        <p className="text-muted-foreground mt-1">
          会議室の利用状況を分析・可視化します
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryStats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-500 font-medium">
                        {stat.change}
                      </span>{' '}
                      {stat.changeLabel}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Room Utilization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              会議室別稼働率
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {roomUtilization.map((room) => (
              <div key={room.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium truncate mr-2">{room.name}</span>
                  <span className="text-muted-foreground shrink-0">
                    {room.rate}%
                  </span>
                </div>
                <div className="h-3 w-full rounded-full bg-muted/50 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${room.color} transition-all duration-500`}
                    style={{ width: `${room.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Peak Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              時間帯別予約数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-2 h-48">
              {peakHours.map((hour) => {
                const heightPct = (hour.count / maxPeakCount) * 100
                const isHighest = hour.count === maxPeakCount
                return (
                  <div
                    key={hour.hour}
                    className="flex flex-col items-center gap-1 flex-1"
                  >
                    <span className="text-xs font-medium text-muted-foreground">
                      {hour.count}
                    </span>
                    <div
                      className={`w-full rounded-t-md transition-all duration-500 ${
                        isHighest
                          ? 'bg-primary'
                          : heightPct > 60
                          ? 'bg-primary/70'
                          : 'bg-primary/40'
                      }`}
                      style={{ height: `${heightPct}%`, minHeight: '8px' }}
                    />
                    <span className="text-[10px] text-muted-foreground">
                      {hour.hour.slice(0, 2)}
                    </span>
                  </div>
                )
              })}
            </div>
            <Separator className="mt-2 mb-3" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">ピーク時間帯</span>
              <Badge variant="info">14:00 - 16:00</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Top Bookers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              予約数ランキング
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topBookers.map((booker, index) => (
                <div
                  key={booker.name}
                  className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
                >
                  <div
                    className={`flex items-center justify-center h-8 w-8 rounded-full text-sm font-bold ${
                      index === 0
                        ? 'bg-yellow-500/20 text-yellow-500'
                        : index === 1
                        ? 'bg-gray-400/20 text-gray-400'
                        : index === 2
                        ? 'bg-orange-600/20 text-orange-600'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{booker.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {booker.department}
                    </p>
                  </div>
                  <Badge variant="secondary">{booker.count}件</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              利用状況サマリー
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-2xl font-bold text-primary">3.2h</p>
                <p className="text-xs text-muted-foreground mt-1">
                  平均利用時間
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-2xl font-bold text-primary">6.8人</p>
                <p className="text-xs text-muted-foreground mt-1">
                  平均参加人数
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-2xl font-bold text-primary">92%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  出席率
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-2xl font-bold text-primary">4.2%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  キャンセル率
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="text-sm font-medium">人気の設備</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="info">プロジェクター (87回)</Badge>
                <Badge variant="info">ホワイトボード (64回)</Badge>
                <Badge variant="info">ビデオ会議 (58回)</Badge>
                <Badge variant="info">TVモニター (42回)</Badge>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="text-sm font-medium">曜日別傾向</h4>
              <div className="flex items-end gap-1">
                {[
                  { day: '月', value: 65 },
                  { day: '火', value: 80 },
                  { day: '水', value: 95 },
                  { day: '木', value: 78 },
                  { day: '金', value: 55 },
                ].map((d) => (
                  <div key={d.day} className="flex flex-col items-center gap-1 flex-1">
                    <div
                      className="w-full rounded-t-sm bg-primary/60"
                      style={{ height: `${d.value * 0.6}px` }}
                    />
                    <span className="text-xs text-muted-foreground">{d.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
