import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-pill px-3 py-1 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-white shadow-sm hover:bg-primary-hover",
        secondary:
          "bg-purple-500 text-white shadow-sm hover:bg-purple-600",
        destructive:
          "bg-danger text-white shadow-sm hover:bg-danger-hover",
        outline: "border-2 border-border bg-surface text-text-primary hover:bg-surface-soft",
        success:
          "bg-success text-white shadow-sm hover:bg-success-hover",
        warning:
          "bg-warning text-white shadow-sm hover:bg-orange-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
