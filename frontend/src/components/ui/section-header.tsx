import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { IconBadge } from "./icon-badge";

export interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: LucideIcon;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  variant?: "primary" | "success" | "warning" | "danger" | "info" | "purple" | "orange";
}

export const SectionHeader = React.forwardRef<HTMLDivElement, SectionHeaderProps>(
  ({ className, icon, title, description, actions, variant = "primary", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center justify-between gap-3", className)}
        {...props}
      >
        <div className="flex items-center gap-3">
          <IconBadge icon={icon} variant={variant} />
          <div>
            <h2 className="text-xl font-bold text-text-primary">{title}</h2>
            {description && (
              <p className="text-sm text-text-secondary">{description}</p>
            )}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    );
  }
);

SectionHeader.displayName = "SectionHeader";
