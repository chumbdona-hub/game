import { cn } from "../../utils/cn";

export function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="text-sm font-medium text-white">{label}</div>
        <div className="text-xs text-white/60">{format ? format(value) : value.toFixed(2)}</div>
      </div>
      <input
        className={cn(
          "h-2 w-full cursor-pointer appearance-none rounded-lg bg-white/10",
          "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white",
          "[&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-black/30"
        )}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}
