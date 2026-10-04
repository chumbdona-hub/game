import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../utils/cn";

export function Button({
  className,
  variant = "primary",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  children: ReactNode;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition active:scale-[0.99] disabled:opacity-50 disabled:active:scale-100";
  const variants: Record<string, string> = {
    primary:
      "bg-gradient-to-br from-[color:var(--nexus-accent-a)] to-[color:var(--nexus-accent-b)] text-slate-950 shadow-lg shadow-black/20",
    secondary: "bg-white/10 text-white hover:bg-white/15",
    ghost: "bg-transparent text-white/80 hover:bg-white/10",
    danger: "bg-rose-500/80 text-white hover:bg-rose-500",
  };
  return <button className={cn(base, variants[variant], className)} {...props} />;
}
