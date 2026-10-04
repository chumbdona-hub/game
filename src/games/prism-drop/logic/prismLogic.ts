import { mulberry32, rngPick, type Rng } from "../config/rng";
import { rotateCells, shapeById, shapeBounds, SHAPES, type Cell } from "../config/shapes";

export const GRID_SIZE = 8;
export const GRID_CELLS = GRID_SIZE * GRID_SIZE;

export type GridData = number[]; // -1 empty else color index

export interface TrayPiece {
  shapeId: string;
  rot: number; // 0..3
  color: number; // 0..palette-1
}

export interface RunParams {
  seed: number;
  mode: "classic" | "daily" | "adventure";
  adventure?: { levelId: string; goalLines: number; maxMoves: number; movesUsed: number };
}

export interface RunState {
  version: 1;
  seed: number;
  mode: RunParams["mode"];
  score: number;
  combo: number;
  linesClearedTotal: number;
  grid: GridData;
  tray: Array<TrayPiece | null>; // 3
  rngState: { seed: number; steps: number };
  undo?: {
    grid: GridData;
    tray: Array<TrayPiece | null>;
    score: number;
    combo: number;
    linesClearedTotal: number;
    adventureMovesUsed?: number;
  };
  adventure?: RunParams["adventure"];
}

export interface MoveResult {
  placed: boolean;
  placedCells: Cell[];
  clearedCells: Cell[];
  clearedLines: number;
  scoreDelta: number;
  comboAfter: number;
  gameOver: boolean;
}

export function newRun(params: RunParams): RunState {
  const rngState = { seed: params.seed >>> 0, steps: 0 };
  const grid = new Array(GRID_CELLS).fill(-1);

  const tray = generateTray(grid, rngState);

  return {
    version: 1,
    seed: params.seed >>> 0,
    mode: params.mode,
    score: 0,
    combo: 0,
    linesClearedTotal: 0,
    grid,
    tray,
    rngState,
    adventure: params.adventure,
  };
}

export function cloneRun(r: RunState): RunState {
  return {
    ...r,
    grid: r.grid.slice(),
    tray: r.tray.map((p) => (p ? { ...p } : null)),
    rngState: { ...r.rngState },
    undo: r.undo
      ? {
          ...r.undo,
          grid: r.undo.grid.slice(),
          tray: r.undo.tray.map((p) => (p ? { ...p } : null)),
        }
      : undefined,
    adventure: r.adventure ? { ...r.adventure } : undefined,
  };
}

export function getRng(rngState: { seed: number; steps: number }): Rng {
  // Deterministic advancement: recreate generator and advance `steps`.
  const r = mulberry32(rngState.seed);
  for (let i = 0; i < rngState.steps; i++) r();
  return () => {
    rngState.steps += 1;
    return r();
  };
}

export function generateTray(grid: GridData, rngState: { seed: number; steps: number }): Array<TrayPiece | null> {
  const rng = getRng(rngState);
  const paletteSize = 6;

  // Smart generation: ensure at least one of the three pieces can be placed.
  for (let attempt = 0; attempt < 30; attempt++) {
    const tray: Array<TrayPiece | null> = [0, 1, 2].map(() => {
      const def = rngPick(rng, SHAPES);
      const rot = Math.floor(rng() * 4);
      const color = Math.floor(rng() * paletteSize);
      return { shapeId: def.id, rot, color };
    });
    if (hasAnyPlacement(grid, tray)) return tray;
  }

  // Fallback: brute search for any shape that fits.
  for (const def of SHAPES) {
    for (let rot = 0; rot < 4; rot++) {
      const color = Math.floor(getRng(rngState)() * 6);
      const tray = [
        { shapeId: def.id, rot, color },
        { shapeId: "dot", rot: 0, color },
        { shapeId: "dot", rot: 0, color },
      ];
      if (hasAnyPlacement(grid, tray)) return tray;
    }
  }

  return [{ shapeId: "dot", rot: 0, color: 0 }, null, null];
}

export function pieceCells(piece: TrayPiece): Cell[] {
  const base = shapeById(piece.shapeId).cells;
  return rotateCells(base, piece.rot);
}

export function canPlace(grid: GridData, piece: TrayPiece, gx: number, gy: number) {
  const cells = pieceCells(piece);
  for (const c of cells) {
    const x = gx + c.x;
    const y = gy + c.y;
    if (x < 0 || y < 0 || x >= GRID_SIZE || y >= GRID_SIZE) return false;
    if (grid[y * GRID_SIZE + x] !== -1) return false;
  }
  return true;
}

export function findAnyPlacement(grid: GridData, piece: TrayPiece): { gx: number; gy: number } | null {
  const cells = pieceCells(piece);
  const b = shapeBounds(cells);
  for (let y = 0; y <= GRID_SIZE - b.h; y++) {
    for (let x = 0; x <= GRID_SIZE - b.w; x++) {
      if (canPlace(grid, piece, x, y)) return { gx: x, gy: y };
    }
  }
  return null;
}

export function hasAnyPlacement(grid: GridData, tray: Array<TrayPiece | null>) {
  return tray.some((p) => (p ? !!findAnyPlacement(grid, p) : false));
}

export function placeFromTray(run: RunState, trayIndex: number, gx: number, gy: number): MoveResult {
  const piece = run.tray[trayIndex];
  if (!piece) {
    return {
      placed: false,
      placedCells: [],
      clearedCells: [],
      clearedLines: 0,
      scoreDelta: 0,
      comboAfter: run.combo,
      gameOver: isGameOver(run.grid, run.tray),
    };
  }
  if (!canPlace(run.grid, piece, gx, gy)) {
    return {
      placed: false,
      placedCells: [],
      clearedCells: [],
      clearedLines: 0,
      scoreDelta: 0,
      comboAfter: run.combo,
      gameOver: isGameOver(run.grid, run.tray),
    };
  }

  // Save undo snapshot before the move.
  run.undo = {
    grid: run.grid.slice(),
    tray: run.tray.map((p) => (p ? { ...p } : null)),
    score: run.score,
    combo: run.combo,
    linesClearedTotal: run.linesClearedTotal,
    adventureMovesUsed: run.adventure?.movesUsed,
  };

  const placedCells: Cell[] = [];
  for (const c of pieceCells(piece)) {
    const x = gx + c.x;
    const y = gy + c.y;
    run.grid[y * GRID_SIZE + x] = piece.color;
    placedCells.push({ x, y });
  }
  run.tray[trayIndex] = null;

  const clearRes = clearLines(run.grid);

  // Scoring
  const basePlace = placedCells.length * 10;
  const baseClear = clearRes.lines * 110 + clearRes.clearedCells.length * 4;

  let comboAfter = run.combo;
  if (clearRes.lines > 0) comboAfter += 1;
  else comboAfter = 0;

  const multiplier = 1 + comboAfter * 0.35;
  const streakBonus = clearRes.lines > 0 ? 40 * comboAfter : 0;
  const scoreDelta = Math.floor((basePlace + baseClear + streakBonus) * multiplier);

  run.score += scoreDelta;
  run.combo = comboAfter;
  run.linesClearedTotal += clearRes.lines;

  // Refill tray when all pieces used.
  if (run.tray.every((p) => !p)) {
    run.tray = generateTray(run.grid, run.rngState);
  }

  // Adventure move count
  if (run.adventure) {
    run.adventure.movesUsed += 1;
  }

  const gameOver = isGameOver(run.grid, run.tray) || isAdventureFailed(run);

  return {
    placed: true,
    placedCells,
    clearedCells: clearRes.clearedCells,
    clearedLines: clearRes.lines,
    scoreDelta,
    comboAfter,
    gameOver,
  };
}

export function clearLines(grid: GridData): { lines: number; clearedCells: Cell[] } {
  const fullRows: number[] = [];
  const fullCols: number[] = [];

  for (let y = 0; y < GRID_SIZE; y++) {
    let full = true;
    for (let x = 0; x < GRID_SIZE; x++) {
      if (grid[y * GRID_SIZE + x] === -1) {
        full = false;
        break;
      }
    }
    if (full) fullRows.push(y);
  }

  for (let x = 0; x < GRID_SIZE; x++) {
    let full = true;
    for (let y = 0; y < GRID_SIZE; y++) {
      if (grid[y * GRID_SIZE + x] === -1) {
        full = false;
        break;
      }
    }
    if (full) fullCols.push(x);
  }

  const clearedCells: Cell[] = [];
  for (const y of fullRows) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if (grid[y * GRID_SIZE + x] !== -1) clearedCells.push({ x, y });
      grid[y * GRID_SIZE + x] = -1;
    }
  }
  for (const x of fullCols) {
    for (let y = 0; y < GRID_SIZE; y++) {
      if (grid[y * GRID_SIZE + x] !== -1) clearedCells.push({ x, y });
      grid[y * GRID_SIZE + x] = -1;
    }
  }

  // Deduplicate cells if row+col overlaps
  const seen = new Set<number>();
  const uniq: Cell[] = [];
  for (const c of clearedCells) {
    const k = c.y * GRID_SIZE + c.x;
    if (seen.has(k)) continue;
    seen.add(k);
    uniq.push(c);
  }

  return { lines: fullRows.length + fullCols.length, clearedCells: uniq };
}

export function bombClear(run: RunState, gx: number, gy: number) {
  // Save undo snapshot before bombing.
  run.undo = {
    grid: run.grid.slice(),
    tray: run.tray.map((p) => (p ? { ...p } : null)),
    score: run.score,
    combo: run.combo,
    linesClearedTotal: run.linesClearedTotal,
    adventureMovesUsed: run.adventure?.movesUsed,
  };

  const cleared: Cell[] = [];
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const x = gx + dx;
      const y = gy + dy;
      if (x < 0 || y < 0 || x >= GRID_SIZE || y >= GRID_SIZE) continue;
      const idx = y * GRID_SIZE + x;
      if (run.grid[idx] !== -1) {
        run.grid[idx] = -1;
        cleared.push({ x, y });
      }
    }
  }

  const clearRes = clearLines(run.grid);
  const bonus = cleared.length * 8 + clearRes.lines * 120;
  run.score += bonus;
  run.linesClearedTotal += clearRes.lines;
  // bombing does not increase combo, but clears still count as a "hit" to keep flow.
  if (clearRes.lines > 0) run.combo += 1;

  if (run.adventure) run.adventure.movesUsed += 1;

  return { bombed: cleared, clearedLines: clearRes.lines, clearedCells: clearRes.clearedCells, scoreDelta: bonus };
}

export function tryUndo(run: RunState) {
  if (!run.undo) return false;
  run.grid = run.undo.grid.slice();
  run.tray = run.undo.tray.map((p) => (p ? { ...p } : null));
  run.score = run.undo.score;
  run.combo = run.undo.combo;
  run.linesClearedTotal = run.undo.linesClearedTotal;
  if (run.adventure && typeof run.undo.adventureMovesUsed === "number") {
    run.adventure.movesUsed = run.undo.adventureMovesUsed;
  }
  run.undo = undefined;
  return true;
}

export function isGameOver(grid: GridData, tray: Array<TrayPiece | null>) {
  return !hasAnyPlacement(grid, tray);
}

export function isAdventureComplete(run: RunState) {
  if (!run.adventure) return false;
  return run.linesClearedTotal >= run.adventure.goalLines;
}

export function isAdventureFailed(run: RunState) {
  if (!run.adventure) return false;
  return run.adventure.movesUsed >= run.adventure.maxMoves && !isAdventureComplete(run);
}
