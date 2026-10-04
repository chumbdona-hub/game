import { cn } from "../../utils/cn";

export function Select<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (v: T) => void;
}) {
  return (
    <label className="block rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="mb-2 text-sm font-medium text-white">{label}</div>
      <select
        className={cn(
          "w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white",
          "focus:outline-none focus:ring-1 focus:ring-[color:var(--nexus-accent-a)]"
        )}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
