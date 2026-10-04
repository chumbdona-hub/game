import { useMemo } from "react";
import { Modal } from "../../core/ui/Modal";
import { Button } from "../../core/ui/Button";
import { useAppStore } from "../../core/store/useAppStore";
import { todayKey } from "../../core/device";
import { AudioManager } from "../../core/audio/AudioManager";

export function DailyRewardModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const today = useMemo(() => todayKey(), []);
  const last = useAppStore((s) => s.profile.lastDailyClaimDate);
  const claim = useAppStore((s) => s.claimDailyReward);

  const claimed = last === today;

  return (
    <Modal open={open} onClose={onClose} title="Daily Reward">
      <div className="space-y-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm text-white/80">Login bonus</div>
          <div className="mt-1 text-2xl font-semibold text-white">+50 coins</div>
          <div className="mt-2 text-xs text-white/60">One claim per calendar day.</div>
        </div>

        <Button
          disabled={claimed}
          onClick={() => {
            const ok = claim(today, 50);
            if (ok) AudioManager.instance.play("reward");
          }}
        >
          {claimed ? "Claimed" : "Claim"}
        </Button>
      </div>
    </Modal>
  );
}
