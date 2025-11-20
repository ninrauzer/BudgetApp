import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:scale-105 active:scale-95",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/50 focus-visible:ring-indigo-500",
        destructive:
          "bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/40 hover:shadow-xl hover:shadow-red-500/50 focus-visible:ring-red-500",
        outline:
          "border-2 border-border bg-white text-text-primary shadow-sm hover:border-indigo-500 hover:shadow-md hover:bg-indigo-50/50",
        secondary:
          "bg-gradient-to-br from-surface-soft to-gray-100 text-text-primary shadow-sm hover:from-surface hover:to-gray-200 hover:shadow-md",
        ghost: "text-text-primary hover:bg-surface-soft hover:text-indigo-600",
        link: "text-indigo-600 underline-offset-4 hover:underline hover:text-indigo-700",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
