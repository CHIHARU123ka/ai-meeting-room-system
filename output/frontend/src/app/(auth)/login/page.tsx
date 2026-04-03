'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Mail, Lock, LogIn, Chrome, Github } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/lib/hooks/use-auth'

const loginSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(6, 'パスワードは6文字以上です'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const { login } = useAuth()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true)
    try {
      await login(data)
    } catch {
      // Error handled in useAuth
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDemoLogin = async () => {
    setIsSubmitting(true)
    try {
      await login({ email: 'demo@example.com', password: 'demo123' })
    } catch {
      // Error handled in useAuth
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="glass-card border-border/50">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">ログイン</CardTitle>
          <CardDescription>
            アカウントにサインインしてください
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="pl-10"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">パスワード</Label>
                <Link
                  href="/login"
                  className="text-xs text-primary hover:underline"
                >
                  パスワードを忘れた場合
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="パスワードを入力"
                  className="pl-10"
                  {...register('password')}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full luxury-gradient text-white"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  ログイン
                </>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">または</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" size="lg" disabled={isSubmitting}>
              <Chrome className="mr-2 h-4 w-4" />
              Google
            </Button>
            <Button variant="outline" size="lg" disabled={isSubmitting}>
              <Github className="mr-2 h-4 w-4" />
              GitHub
            </Button>
          </div>

          <Button
            variant="secondary"
            className="w-full"
            onClick={handleDemoLogin}
            disabled={isSubmitting}
          >
            デモアカウントでログイン
          </Button>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            アカウントをお持ちでない場合は{' '}
            <Link href="/register" className="text-primary font-medium hover:underline">
              新規登録
            </Link>
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
