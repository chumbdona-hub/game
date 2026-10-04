export function NexusLogo({ small }: { small?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={
          "grid place-items-center rounded-2xl border border-white/10 bg-white/5 shadow-lg shadow-black/20 " +
          (small ? "h-10 w-10" : "h-12 w-12")
        }
      >
        <svg width={small ? 22 : 26} height={small ? 22 : 26} viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2.7 19.2 6.9v10.2L12 21.3 4.8 17.1V6.9L12 2.7Z"
            stroke="url(#g)"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <path
            d="M12 7.3 15.9 9.6v4.8L12 16.7 8.1 14.4V9.6L12 7.3Z"
            stroke="url(#g)"
            strokeWidth="1.7"
            strokeLinejoin="round"
            opacity="0.9"
          />
          <defs>
            <linearGradient id="g" x1="4" y1="4" x2="20" y2="20" gradientUnits="userSpaceOnUse">
              <stop stopColor="var(--nexus-accent-a)" />
              <stop offset="1" stopColor="var(--nexus-accent-b)" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="leading-tight">
        <div className={"font-semibold tracking-wide text-white " + (small ? "text-sm" : "text-base")}>ARCADE NEXUS</div>
        <div className={"text-white/60 " + (small ? "text-[11px]" : "text-xs")}>Original games • PWA-ready</div>
      </div>
    </div>
  );
}
