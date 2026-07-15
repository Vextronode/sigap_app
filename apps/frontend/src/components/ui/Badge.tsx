import type { HTMLAttributes } from "react";
import { cn } from "../../utils/cn";

type BadgeTone = "safe" | "warning" | "orange" | "danger" | "info" | "neutral";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
};

export const Badge = ({ className, tone = "neutral", children, ...props }: BadgeProps) => (
  <span className={cn("badge", `badge--${tone}`, className)} {...props}>
    {children}
  </span>
);
