import { cn } from "../../utils/cn";

export function Toggle({
  value,
  onChange,
  label,
  description,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 p-3 text-left",
        value ? "ring-1 ring-[color:var(--nexus-accent-a)]" : ""
      )}
      onClick={() => onChange(!value)}
    >
      <div className="min-w-0">
        <div className="text-sm font-medium text-white">{label}</div>
        {description ? <div className="text-xs text-white/60">{description}</div> : null}
      </div>
      <div
        className={cn(
          "h-6 w-11 rounded-full border border-white/15 p-0.5 transition",
          value ? "bg-[color:var(--nexus-accent-a)]/40" : "bg-white/10"
        )}
      >
        <div
          className={cn(
            "h-5 w-5 rounded-full bg-white transition",
            value ? "translate-x-5" : "translate-x-0"
          )}
        />
      </div>
    </button>
  );
}
