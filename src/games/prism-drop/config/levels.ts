export interface AdventureLevel {
  id: string;
  name: string;
  seed: number;
  goalLines: number;
  maxMoves: number;
  rewardCoins: number;
}

export const ADVENTURE_LEVELS: AdventureLevel[] = [
  { id: "a1", name: "Warmup Grid", seed: 101, goalLines: 4, maxMoves: 18, rewardCoins: 30 },
  { id: "a2", name: "Clean Sweep", seed: 202, goalLines: 6, maxMoves: 20, rewardCoins: 40 },
  { id: "a3", name: "Tight Corners", seed: 303, goalLines: 8, maxMoves: 22, rewardCoins: 55 },
  { id: "a4", name: "Combo Lesson", seed: 404, goalLines: 10, maxMoves: 24, rewardCoins: 70 },
  { id: "a5", name: "Glass Maze", seed: 505, goalLines: 12, maxMoves: 26, rewardCoins: 90 },
  { id: "a6", name: "Prism Trial", seed: 606, goalLines: 14, maxMoves: 28, rewardCoins: 120 },
];
