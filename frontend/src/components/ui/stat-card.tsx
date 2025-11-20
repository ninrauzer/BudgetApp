import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "./card";

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "success" | "danger" | "info" | "warning" | "purple" | "primary";
  icon: LucideIcon;
  label: string;
  value: string | number;
  currency?: string; // 'PEN', 'USD', etc.
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const variantClasses = {
  success: "from-emerald-400/90 to-emerald-500/90",
  danger: "from-red-400/90 to-red-500/90",
  info: "from-blue-400/90 to-blue-500/90",
  warning: "from-orange-400/90 to-orange-500/90",
  purple: "from-purple-400/90 to-purple-500/90",
  primary: "from-primary/90 to-blue-600/90",
};

const variantTextClasses = {
  success: "text-emerald-100",
  danger: "text-red-100",
  info: "text-blue-100",
  warning: "text-orange-100",
  purple: "text-purple-100",
  primary: "text-blue-100",
};

export const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ className, variant = "success", icon: Icon, label, value, currency, subtitle, trend, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn(
          "bg-gradient-to-br text-white border-0 backdrop-blur-md shadow-lg",
          variantClasses[variant],
          className
        )}
        {...props}
      >
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <Icon className="w-6 h-6" strokeWidth={2.5} />
            </div>
            <p className={cn("font-medium", variantTextClasses[variant])}>
              {label}
            </p>
          </div>
          
          <div className="flex items-baseline gap-3">
            <p className="text-3xl font-bold flex items-baseline gap-2">
              <span>{value}</span>
              {currency && <span className="text-2xl font-bold opacity-90">{currency}</span>}
            </p>
            {trend && (
              <span
                className={cn(
                  "text-sm font-semibold",
                  trend.isPositive ? "text-white/90" : "text-white/70"
                )}
              >
                {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
              </span>
            )}
          </div>
          
          {subtitle && (
            <p className={cn("text-sm mt-2", variantTextClasses[variant])}>
              {subtitle}
            </p>
          )}
        </CardContent>
      </Card>
    );
  }
);

StatCard.displayName = "StatCard";
