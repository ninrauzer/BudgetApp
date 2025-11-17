import * as React from "react";
import { cn } from "@/lib/utils";

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ className, title, subtitle, actions, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center justify-between", className)}
        {...props}
      >
        <div>
          <h1 className="text-3xl font-bold text-text-primary">{title}</h1>
          {subtitle && <p className="text-text-secondary">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    );
  }
);

PageHeader.displayName = "PageHeader";
