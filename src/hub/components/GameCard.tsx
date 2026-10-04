import { useMemo } from "react";
import type { GameMeta } from "../../games/registry";
import { Button } from "../../core/ui/Button";
import { cn } from "../../utils/cn";

export function GameCard({
  meta,
  disabled,
  onPlay,
  onContinue,
  continueLabel,
  stats,
}: {
  meta: GameMeta;
  disabled: boolean;
  onPlay: () => void;
  onContinue?: () => void;
  continueLabel?: string;
  stats?: { label: string; value: string }[];
}) {
  const bg = useMemo(() => {
    return {
      background:
        `radial-gradient(600px 300px at 30% 0%, ${meta.accent.a}33, transparent 60%),` +
        `radial-gradient(700px 400px at 100% 40%, ${meta.accent.b}33, transparent 60%),` +
        `linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))`,
    } as const;
  }, [meta.accent.a, meta.accent.b]);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-white/10 p-4 shadow-2xl shadow-black/30",
        disabled ? "opacity-80" : ""
      )}
      style={bg}
    >
      <div className="absolute inset-0 opacity-60">
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full blur-3xl" style={{ background: meta.accent.a }} />
        <div className="absolute -right-24 top-6 h-72 w-72 rounded-full blur-3xl" style={{ background: meta.accent.b }} />
      </div>

      <div className="relative">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <div className="text-lg font-semibold text-white">{meta.title}</div>
            <div className="text-sm text-white/70">{meta.subtitle}</div>
          </div>
          <div className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-white/70">Phase {meta.phase}</div>
        </div>

        <div className="mb-4">
          <div className="h-28 w-full overflow-hidden rounded-2xl border border-white/10 bg-black/20">
            <AnimatedThumb a={meta.accent.a} b={meta.accent.b} />
          </div>
        </div>

        {stats && stats.length ? (
          <div className="mb-4 grid grid-cols-2 gap-2">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <div className="text-[11px] uppercase tracking-wide text-white/60">{s.label}</div>
                <div className="mt-1 text-sm font-semibold text-white">{s.value}</div>
              </div>
            ))}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {onContinue ? (
            <Button disabled={disabled} onClick={onContinue} className="flex-1">
              {continueLabel ?? "Continue"}
            </Button>
          ) : null}
          <Button disabled={disabled} variant={onContinue ? "secondary" : "primary"} onClick={onPlay} className="flex-1">
            {disabled ? "Locked" : "Play"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function AnimatedThumb({ a, b }: { a: string; b: string }) {
  return (
    <div className="relative h-full w-full">
      <div
        className="absolute inset-0"
        style={{
          background:
            `repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 14px),` +
            `repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 14px),` +
            `radial-gradient(800px 200px at 20% 30%, ${a}55, transparent 55%),` +
            `radial-gradient(700px 240px at 80% 60%, ${b}55, transparent 55%)`,
        }}
      />
      <div className="absolute inset-0">
        <div
          className="absolute left-6 top-5 h-10 w-10 rounded-xl blur-[0.5px]"
          style={{
            background: `linear-gradient(135deg, ${a}, ${b})`,
            animation: "nexusFloat 3.6s ease-in-out infinite",
          }}
        />
        <div
          className="absolute right-10 bottom-6 h-7 w-7 rounded-lg"
          style={{
            background: `linear-gradient(135deg, ${b}, ${a})`,
            animation: "nexusFloat 2.8s ease-in-out infinite",
          }}
        />
      </div>
      <style>{`
        @keyframes nexusFloat {
          0%,100% { transform: translate3d(0,0,0) rotate(0deg); opacity: 0.85; }
          50% { transform: translate3d(0,-6px,0) rotate(6deg); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
