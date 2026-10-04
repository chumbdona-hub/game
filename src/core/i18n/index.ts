import { useMemo } from "react";
import { useAppStore } from "../store/useAppStore";
import type { Language } from "../store/types";

const DICT = {
  en: {
    app_name: "ARCADE NEXUS",
    play: "Play",
    continue: "Continue",
    settings: "Settings",
    profile: "Profile",
    coins: "Coins",
    level: "Level",
    daily_reward: "Daily Reward",
    claim: "Claim",
    claimed: "Claimed",
    close: "Close",
    back: "Back",
    pause: "Pause",
    resume: "Resume",
    quit_to_hub: "Quit to Hub",

    prismdrop_title: "Prism Drop",
    prismdrop_classic: "Classic",
    prismdrop_daily: "Daily Challenge",
    prismdrop_adventure: "Adventure",
    prismdrop_score: "Score",
    prismdrop_lines: "Lines",
    prismdrop_game_over: "Run ended",
    prismdrop_victory: "Goal reached!",
    prismdrop_restart: "Restart",
    prismdrop_next_level: "Next Level",
    prismdrop_level: "Level",

    power_rotate: "Rotate",
    power_bomb: "Bomb",
    power_undo: "Undo",
    buy: "Buy",
    not_enough_coins: "Not enough coins",

    coming_soon: "Coming in later phase",
  },
  vi: {
    app_name: "ARCADE NEXUS",
    play: "Chơi",
    continue: "Tiếp tục",
    settings: "Cài đặt",
    profile: "Hồ sơ",
    coins: "Xu",
    level: "Cấp",
    daily_reward: "Thưởng hằng ngày",
    claim: "Nhận",
    claimed: "Đã nhận",
    close: "Đóng",
    back: "Quay lại",
    pause: "Tạm dừng",
    resume: "Tiếp tục",
    quit_to_hub: "Về sảnh",

    prismdrop_title: "Prism Drop",
    prismdrop_classic: "Cổ điển",
    prismdrop_daily: "Thử thách ngày",
    prismdrop_adventure: "Phiêu lưu",
    prismdrop_score: "Điểm",
    prismdrop_lines: "Dòng",
    prismdrop_game_over: "Kết thúc",
    prismdrop_victory: "Hoàn thành mục tiêu!",
    prismdrop_restart: "Chơi lại",
    prismdrop_next_level: "Màn tiếp",
    prismdrop_level: "Màn",

    power_rotate: "Xoay",
    power_bomb: "Bom",
    power_undo: "Hoàn tác",
    buy: "Mua",
    not_enough_coins: "Không đủ xu",

    coming_soon: "Sẽ có ở giai đoạn sau",
  },
} as const;

export type I18nKey = keyof (typeof DICT)["en"];

export function t(lang: Language, key: I18nKey) {
  const table = DICT[lang] ?? DICT.en;
  return (table as any)[key] ?? key;
}

export function useT() {
  const lang = useAppStore((s) => s.settings.language);
  return useMemo(() => {
    return (key: I18nKey) => t(lang, key);
  }, [lang]);
}
