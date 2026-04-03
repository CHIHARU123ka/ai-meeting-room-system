import { Sparkles } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-purple-500/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(120,119,198,0.15),transparent_50%)]" />
      </div>
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">AI Meeting Room</h1>
        </div>
        {children}
      </div>
    </div>
  )
}
