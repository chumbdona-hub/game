import type { ReactNode } from "react";
import { cn } from "../../utils/cn";
import { Button } from "./Button";

export function Modal({
  open,
  title,
  children,
  onClose,
  className,
}: {
  open: boolean;
  title?: ReactNode;
  children: ReactNode;
  onClose: () => void;
  className?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className={cn(
          "relative w-full max-w-lg rounded-2xl border border-white/10 bg-black/40 p-4 shadow-2xl",
          className
        )}
        role="dialog"
        aria-modal="true"
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="text-base font-semibold text-white">{title}</div>
          <Button variant="ghost" onClick={onClose} aria-label="Close">
            ✕
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
