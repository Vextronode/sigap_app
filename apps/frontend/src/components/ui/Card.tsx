import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../utils/cn";

type CardProps = HTMLAttributes<HTMLElement> & {
  title?: string;
  icon?: ReactNode;
  action?: ReactNode;
};

export const Card = ({ title, icon, action, className, children, ...props }: CardProps) => (
  <section className={cn("card", className)} {...props}>
    {(title || icon || action) && (
      <div className="card__header">
        <div className="card__title-group">
          {icon && <span className="card__icon">{icon}</span>}
          {title && <h2 className="card__title">{title}</h2>}
        </div>
        {action}
      </div>
    )}
    {children}
  </section>
);
