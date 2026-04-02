import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95',
  {
    variants: {
      variant: {
        default:
          'glass-strong text-primary-foreground hover:bg-white/30 dark:hover:bg-black/30 shadow-lg hover:shadow-xl',
        destructive:
          'glass-strong text-destructive-foreground hover:bg-red-500/20 dark:hover:bg-red-500/20 shadow-lg hover:shadow-xl',
        outline:
          'glass border-2 border-primary/20 hover:border-primary/40 hover:bg-white/10 dark:hover:bg-black/10',
        secondary:
          'glass bg-secondary/50 text-secondary-foreground hover:bg-secondary/70',
        ghost: 'hover:bg-white/10 dark:hover:bg-black/10 hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        luxury:
          'luxury-gradient text-white shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300 animate-glow',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-lg px-8',
        xl: 'h-12 rounded-xl px-10 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
