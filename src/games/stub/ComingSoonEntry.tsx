import { useT } from "../../core/i18n";
import { Button } from "../../core/ui/Button";

export default function ComingSoonEntry({ onQuit }: { onQuit: () => void }) {
  const t = useT();
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="text-2xl font-semibold text-white">{t("coming_soon")}</div>
      <div className="max-w-md text-sm text-white/70">
        This game is scheduled for a later phase in the build order. Prism Drop is fully playable now.
      </div>
      <Button onClick={onQuit}>{t("quit_to_hub")}</Button>
    </div>
  );
}
