'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  DoorOpen,
  CalendarDays,
  Users,
  TrendingUp,
  ArrowRight,
  Clock,
  Sparkles,
  BarChart3,
  Plus,
  MapPin,
  CalendarCheck,
  CalendarX,
  UserPlus,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/lib/hooks/use-auth'
import { reservationsApi } from '@/lib/api/reservations'
import { cn, formatTime, formatDate, getRelativeTime } from '@/lib/utils'
import type { Reservation } from '@/types'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
}

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const usageData = [
  { name: '月', usage: 65 },
  { name: '火', usage: 78 },
  { name: '水', usage: 90 },
  { name: '木', usage: 85 },
  { name: '金', usage: 72 },
  { name: '土', usage: 30 },
  { name: '日', usage: 15 },
]

const trendData = [
  { name: '1月', reservations: 85, utilization: 62 },
  { name: '2月', reservations: 92, utilization: 68 },
  { name: '3月', reservations: 108, utilization: 71 },
  { name: '4月', reservations: 128, utilization: 73 },
]

// Demo recent activity
const demoActivity = [
  {
    type: 'reservation' as const,
    message: '「週次スプリントレビュー」の予約が確定されました',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    userName: '山田 太郎',
  },
  {
    type: 'cancellation' as const,
    message: '「プロジェクト打ち合わせ」がキャンセルされました',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    userName: '佐藤 花子',
  },
  {
    type: 'user_joined' as const,
    message: '新しいメンバーが参加しました',
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    userName: '田中 次郎',
  },
  {
    type: 'reservation' as const,
    message: '「デザインレビュー」の予約が作成されました',
    timestamp: new Date(Date.now() - 28800000).toISOString(),
    userName: '鈴木 美咲',
  },
  {
    type: 'reservation' as const,
    message: '「経営戦略会議」の参加者が更新されました',
    timestamp: new Date(Date.now() - 43200000).toISOString(),
    userName: '高橋 健一',
  },
]

const activityIcons: Record<string, React.ElementType> = {
  reservation: CalendarCheck,
  cancellation: CalendarX,
  user_joined: UserPlus,
}

const activityColors: Record<string, string> = {
  reservation: 'text-green-500 bg-green-500/10',
  cancellation: 'text-red-500 bg-red-500/10',
  user_joined: 'text-blue-500 bg-blue-500/10',
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info' }> = {
  confirmed: { label: '確定', variant: 'success' },
  pending: { label: '保留中', variant: 'warning' },
  cancelled: { label: 'キャンセル', variant: 'destructive' },
  completed: { label: '完了', variant: 'secondary' },
}

// AI recommendations (demo)
const aiRecommendations = [
  {
    id: '1',
    title: '最適な会議時間の提案',
    description: 'チームメンバーのスケジュール分析に基づき、水曜日の14:00-15:00が最も参加率が高い時間帯です。',
    confidence: 92,
  },
  {
    id: '2',
    title: '会議室の推薦',
    description: '次回のブレインストーミングには、クリエイティブスペースBが設備と雰囲気の面で最適です。',
    confidence: 87,
  },
  {
    id: '3',
    title: '利用パターン最適化',
    description: '金曜午後の会議室利用率が低下傾向にあります。フレキシブルな予約枠の設定を提案します。',
    confidence: 78,
  },
]

export default function DashboardPage() {
  const { user } = useAuth()
  const [reservations, setReservations] = React.useState<Reservation[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function fetchReservations() {
      try {
        const response = await reservationsApi.getReservations()
        setReservations(response.data)
      } catch {
        setReservations([])
      } finally {
        setLoading(false)
      }
    }
    fetchReservations()
  }, [])

  const now = new Date()

  const upcomingReservations = reservations
    .filter(
      (r) =>
        r.status !== 'cancelled' &&
        r.status !== 'completed' &&
        new Date(r.startTime) >= now
    )
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 4)

  const todayReservations = reservations.filter((r) => {
    const start = new Date(r.startTime)
    return (
      start.toDateString() === now.toDateString() &&
      r.status !== 'cancelled'
    )
  })

  const stats = [
    {
      title: '利用可能な会議室',
      value: '12',
      suffix: '室',
      change: '+2',
      icon: DoorOpen,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-500',
    },
    {
      title: '本日の予約',
      value: String(todayReservations.length || 8),
      suffix: '件',
      change: '+3',
      icon: CalendarDays,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10',
      textColor: 'text-purple-500',
    },
    {
      title: '直近の会議',
      value: String(upcomingReservations.length || 3),
      suffix: '件',
      change: '',
      icon: Clock,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-500',
    },
    {
      title: '稼働率',
      value: '73',
      suffix: '%',
      change: '+5%',
      icon: TrendingUp,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-500/10',
      textColor: 'text-orange-500',
    },
  ]

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={stagger}
      className="space-y-8"
    >
      {/* Welcome Section */}
      <motion.div variants={fadeInUp}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              おかえりなさい、{user?.name || 'ゲスト'}さん
            </h1>
            <p className="text-muted-foreground mt-1">
              {formatDate(new Date())}の会議室利用状況をご確認ください
            </p>
          </div>
          <Link href="/reservations">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              新しい予約
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
          >
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold tracking-tight">{stat.value}</span>
                      <span className="text-sm text-muted-foreground">{stat.suffix}</span>
                    </div>
                    {stat.change && (
                      <p className="text-xs text-green-400 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {stat.change}
                      </p>
                    )}
                  </div>
                  <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg', stat.color)}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Usage Chart */}
        <motion.div variants={fadeInUp} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">週間利用率</CardTitle>
                  <CardDescription>今週の会議室利用率推移</CardDescription>
                </div>
                <BarChart3 className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={usageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                  <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
                  <RechartsTooltip
                    contentStyle={{
                      background: 'rgba(0,0,0,0.8)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                    formatter={(value: number) => [`${value}%`, '利用率']}
                  />
                  <Bar
                    dataKey="usage"
                    fill="url(#barGradient)"
                    radius={[6, 6, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#667eea" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#764ba2" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Recommendations */}
        <motion.div variants={fadeInUp}>
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">AI推薦</CardTitle>
              </div>
              <CardDescription>AIによる最適化提案</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {aiRecommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="p-3 rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <h4 className="text-sm font-medium">{rec.title}</h4>
                    <Badge variant="info" className="text-[10px] shrink-0">
                      {rec.confidence}%
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {rec.description}
                  </p>
                  <Progress value={rec.confidence} className="h-1" />
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Reservations + Activity row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Upcoming Reservations - fetched from API */}
        <motion.div variants={fadeInUp} className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">直近の予約</CardTitle>
                  <CardDescription>今後のスケジュール</CardDescription>
                </div>
                <Link href="/reservations">
                  <Button variant="ghost" size="sm" className="gap-1 text-xs">
                    すべて表示
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 animate-pulse">
                      <div className="h-12 w-12 rounded-lg bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 rounded bg-muted" />
                        <div className="h-3 w-1/2 rounded bg-muted" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : upcomingReservations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="p-4 rounded-full bg-muted/50 mb-4">
                    <CalendarDays className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    直近の予約はありません
                  </p>
                  <Link href="/reservations" className="mt-4">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Plus className="h-4 w-4" />
                      予約を作成
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingReservations.map((reservation, index) => {
                    const status = statusConfig[reservation.status]
                    const startDate = new Date(reservation.startTime)
                    const endDate = new Date(reservation.endTime)
                    const isToday = startDate.toDateString() === now.toDateString()

                    return (
                      <React.Fragment key={reservation.id}>
                        <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-accent/30 transition-colors">
                          {/* Date block */}
                          <div
                            className={cn(
                              'flex flex-col items-center justify-center rounded-lg p-2 min-w-[52px]',
                              isToday
                                ? 'bg-primary/15 text-primary'
                                : 'bg-muted text-muted-foreground'
                            )}
                          >
                            <span className="text-xs font-medium">
                              {isToday
                                ? '今日'
                                : startDate.toLocaleDateString('ja-JP', {
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                            </span>
                            <span className="text-lg font-bold leading-none mt-0.5">
                              {formatTime(startDate)}
                            </span>
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-semibold truncate">
                                {reservation.title}
                              </h4>
                              <Badge variant={status.variant} className="shrink-0">
                                {status.label}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground flex-wrap">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {reservation.room.name}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatTime(startDate)} - {formatTime(endDate)}
                              </span>
                              {reservation.attendees.length > 0 && (
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {reservation.attendees.length}名
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {index < upcomingReservations.length - 1 && (
                          <Separator className="opacity-50" />
                        )}
                      </React.Fragment>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Right column: Quick actions + Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick actions */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  クイックアクション
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/reservations" className="block">
                  <Button variant="outline" className="w-full justify-start gap-3 h-11">
                    <div className="p-1.5 rounded-md bg-green-500/10">
                      <Plus className="h-4 w-4 text-green-500" />
                    </div>
                    新しい予約を作成
                  </Button>
                </Link>
                <Link href="/rooms" className="block">
                  <Button variant="outline" className="w-full justify-start gap-3 h-11">
                    <div className="p-1.5 rounded-md bg-blue-500/10">
                      <DoorOpen className="h-4 w-4 text-blue-500" />
                    </div>
                    会議室を探す
                  </Button>
                </Link>
                <Link href="/analytics" className="block">
                  <Button variant="outline" className="w-full justify-start gap-3 h-11">
                    <div className="p-1.5 rounded-md bg-purple-500/10">
                      <TrendingUp className="h-4 w-4 text-purple-500" />
                    </div>
                    利用分析を見る
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent activity feed */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">最近のアクティビティ</CardTitle>
                <CardDescription>直近の更新情報</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {demoActivity.map((activity, index) => {
                    const IconComponent = activityIcons[activity.type] || CalendarCheck
                    const colorClass = activityColors[activity.type] || 'text-gray-500 bg-gray-500/10'

                    return (
                      <div key={index} className="flex items-start gap-3">
                        <div className={cn('p-1.5 rounded-md shrink-0 mt-0.5', colorClass)}>
                          <IconComponent className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm leading-snug">{activity.message}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {activity.userName}
                            </span>
                            <span className="text-xs text-muted-foreground/60">
                              {getRelativeTime(activity.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Trend Chart */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">月間トレンド</CardTitle>
                <CardDescription>予約数と利用率の推移</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                    <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
                    <RechartsTooltip
                      contentStyle={{
                        background: 'rgba(0,0,0,0.8)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="reservations"
                      stroke="#667eea"
                      strokeWidth={2}
                      dot={{ fill: '#667eea', r: 4 }}
                      name="予約数"
                    />
                    <Line
                      type="monotone"
                      dataKey="utilization"
                      stroke="#764ba2"
                      strokeWidth={2}
                      dot={{ fill: '#764ba2', r: 4 }}
                      name="利用率(%)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
