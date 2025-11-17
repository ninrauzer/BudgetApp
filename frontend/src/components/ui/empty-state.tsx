import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: LucideIcon;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, icon: Icon, message, action, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("text-center py-12", className)}
        {...props}
      >
        <Icon className="w-16 h-16 text-text-secondary mx-auto mb-4 opacity-50" />
        <p className="text-text-secondary mb-4">{message}</p>
        {action && (
          <button
            onClick={action.onClick}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            {action.label}
          </button>
        )}
      </div>
    );
  }
);

EmptyState.displayName = "EmptyState";
