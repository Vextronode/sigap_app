import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../utils/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  icon?: ReactNode;
};

export const Button = ({ className, variant = "primary", icon, children, ...props }: ButtonProps) => (
  <button className={cn("button", `button--${variant}`, className)} {...props}>
    {icon}
    <span>{children}</span>
  </button>
);
