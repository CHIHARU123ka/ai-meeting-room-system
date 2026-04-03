'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  CalendarDays,
  Users,
  BarChart3,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Star,
  Zap
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const features = [
  {
    icon: CalendarDays,
    title: 'スマート予約',
    description: 'AIが最適な会議室を提案し、効率的な予約を実現',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Users,
    title: 'チーム管理',
    description: '部署やプロジェクト単位での柔軟な権限管理',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: BarChart3,
    title: 'リアルタイム分析',
    description: '利用状況の可視化と改善提案を自動生成',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: Sparkles,
    title: 'AI最適化',
    description: '機械学習による利用パターン分析と予測',
    color: 'from-orange-500 to-red-500'
  }
]

const benefits = [
  '会議室利用効率を最大40%向上',
  'ダブルブッキングを99%削減',
  '予約時間を平均60%短縮',
  'エネルギーコストを25%削減'
]

const testimonials = [
  {
    name: '田中 太郎',
    role: 'プロジェクトマネージャー',
    company: '株式会社テクノロジー',
    content: 'AIの提案機能により、最適な会議室を瞬時に見つけられるようになりました。',
    rating: 5
  },
  {
    name: '佐藤 花子',
    role: 'オフィスマネージャー',
    company: '合同会社イノベーション',
    content: '利用状況の分析により、オフィス運営の効率が大幅に改善されました。',
    rating: 5
  }
]

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge
              variant="secondary"
              className="mb-6 glass-card px-4 py-2 text-sm font-medium"
            >
              <Zap className="w-4 h-4 mr-2" />
              AI駆動の次世代会議室管理
            </Badge>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-pink-500">
                スマートな
              </span>
              <br />
              会議室管理を実現
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              AIが最適な会議室を提案し、予約の効率化、利用状況の分析、
              そしてチーム全体の生産性向上を支援します。
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="luxury-gradient text-white text-lg px-8">
                <Link href="/register">
                  無料で始める
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8">
                <Link href="/login">
                  ログイン
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">主な機能</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              最新のAI技術を活用した、直感的で効率的な会議室管理システム
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Card className="glass-card p-6 hover-lift h-full">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} shadow-lg mb-4`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                導入効果
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                AI会議室管理システムの導入により、
                オフィス運営の様々な側面で大幅な改善が期待できます。
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle className="h-5 w-5 text-green-400 shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { label: '利用効率', value: '40%', suffix: '向上' },
                { label: '予約時間', value: '60%', suffix: '短縮' },
                { label: 'コスト', value: '25%', suffix: '削減' },
                { label: '満足度', value: '98%', suffix: '' },
              ].map((stat, index) => (
                <Card key={stat.label} className="glass-card p-6 text-center hover-lift">
                  <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {stat.label}{stat.suffix && ` ${stat.suffix}`}
                  </p>
                </Card>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">お客様の声</h2>
            <p className="text-muted-foreground text-lg">導入企業からの評価</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
              >
                <Card className="glass-card p-6 hover-lift h-full">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-foreground mb-4 italic">
                    &ldquo;{testimonial.content}&rdquo;
                  </p>
                  <div>
                    <p className="font-semibold text-sm">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {testimonial.role} - {testimonial.company}
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="glass-card p-12 text-center max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                今すぐ始めましょう
              </h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
                AIの力で、会議室管理を次のレベルへ。
                無料プランからスタートできます。
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="luxury-gradient text-white text-lg px-10">
                  <Link href="/register">
                    無料で始める
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-lg px-8">
                  <Link href="/login">
                    デモを試す
                  </Link>
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-semibold">AI Meeting Room System</span>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; 2024 AI Meeting Room Team. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
