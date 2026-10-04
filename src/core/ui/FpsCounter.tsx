import { useEffect, useRef, useState } from "react";

export function FpsCounter() {
  const [fps, setFps] = useState(0);
  const last = useRef(performance.now());
  const frames = useRef(0);

  useEffect(() => {
    let raf = 0;
    const loop = (t: number) => {
      frames.current += 1;
      const dt = t - last.current;
      if (dt >= 500) {
        setFps(Math.round((frames.current * 1000) / dt));
        frames.current = 0;
        last.current = t;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="pointer-events-none rounded-xl border border-white/10 bg-black/40 px-2 py-1 text-xs tabular-nums text-white/80">
      {fps} fps
    </div>
  );
}
