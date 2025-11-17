import * as React from "react";
import { cn } from "@/lib/utils";

export interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl";
  fullScreen?: boolean;
  message?: string;
}

const sizeClasses = {
  sm: "h-6 w-6 border-2",
  md: "h-12 w-12 border-b-2",
  lg: "h-16 w-16 border-b-2",
  xl: "h-24 w-24 border-b-3",
};

export const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ className, size = "md", fullScreen = false, message, ...props }, ref) => {
    const containerClasses = fullScreen
      ? "fixed inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-50"
      : "flex flex-col items-center justify-center h-64";

    return (
      <div ref={ref} className={cn(containerClasses, className)} {...props}>
        <div
          className={cn(
            "animate-spin rounded-full border-primary",
            sizeClasses[size]
          )}
        />
        {message && (
          <p className="mt-4 text-sm text-text-secondary animate-pulse">
            {message}
          </p>
        )}
      </div>
    );
  }
);

LoadingSpinner.displayName = "LoadingSpinner";
