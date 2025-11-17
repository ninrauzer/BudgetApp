import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface IconBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: LucideIcon;
  variant?: "primary" | "success" | "warning" | "danger" | "info" | "purple" | "orange";
  size?: "sm" | "md" | "lg";
}

const variantClasses = {
  primary: "from-primary to-blue-600",
  success: "from-emerald-400 to-emerald-500",
  warning: "from-amber-500 to-orange-500",
  danger: "from-red-400 to-red-500",
  info: "from-blue-400 to-blue-500",
  purple: "from-purple-500 to-purple-600",
  orange: "from-orange-400 to-orange-500",
};

const sizeClasses = {
  sm: { wrapper: "p-2", icon: "w-4 h-4" },
  md: { wrapper: "p-3", icon: "w-6 h-6" },
  lg: { wrapper: "p-4", icon: "w-8 h-8" },
};

export const IconBadge = React.forwardRef<HTMLDivElement, IconBadgeProps>(
  ({ className, icon: Icon, variant = "primary", size = "md", ...props }, ref) => {
    const sizeConfig = sizeClasses[size];
    
    return (
      <div
        ref={ref}
        className={cn(
          "bg-gradient-to-br rounded-2xl shadow-button",
          sizeConfig.wrapper,
          variantClasses[variant],
          className
        )}
        {...props}
      >
        <Icon className={cn("text-white", sizeConfig.icon)} strokeWidth={2.5} />
      </div>
    );
  }
);

IconBadge.displayName = "IconBadge";
