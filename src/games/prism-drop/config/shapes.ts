export type Cell = { x: number; y: number };

export interface ShapeDef {
  id: string;
  cells: Cell[]; // in local coordinates starting near (0,0)
}

export const SHAPES: ShapeDef[] = [
  { id: "dot", cells: [{ x: 0, y: 0 }] },

  { id: "i2", cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }] },
  { id: "i3", cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }] },
  { id: "i4", cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }] },
  { id: "i5", cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }] },

  { id: "v2", cells: [{ x: 0, y: 0 }, { x: 0, y: 1 }] },
  { id: "v3", cells: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }] },
  { id: "v4", cells: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 }] },
  { id: "v5", cells: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 }, { x: 0, y: 4 }] },

  { id: "sq2", cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }] },

  { id: "l3", cells: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }] },
  { id: "l4", cells: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 2 }] },
  { id: "j4", cells: [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 0, y: 2 }] },

  { id: "t4", cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 1, y: 1 }] },
  { id: "s4", cells: [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }] },
  { id: "z4", cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }] },

  { id: "plus5", cells: [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 1, y: 2 }] },

  { id: "p3", cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }] },
  // 4-block asymmetric "flag" shape
  { id: "flag4", cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 1 }] },

  { id: "c5", cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 2 }] },

  { id: "diag3", cells: [{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 }] },
  { id: "hook5", cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }] },
];

export function shapeById(id: string) {
  const s = SHAPES.find((x) => x.id === id);
  if (!s) throw new Error(`Unknown shape: ${id}`);
  return s;
}

export function rotateCells(cells: Cell[], rot: number): Cell[] {
  const r = ((rot % 4) + 4) % 4;
  if (r === 0) return cells.map((c) => ({ ...c }));

  // Rotate around origin then normalize to (0,0)
  let out = cells.map((c) => ({ ...c }));
  for (let i = 0; i < r; i++) {
    out = out.map((c) => ({ x: -c.y, y: c.x }));
  }
  const minX = Math.min(...out.map((c) => c.x));
  const minY = Math.min(...out.map((c) => c.y));
  return out.map((c) => ({ x: c.x - minX, y: c.y - minY }));
}

export function shapeBounds(cells: Cell[]) {
  const maxX = Math.max(...cells.map((c) => c.x));
  const maxY = Math.max(...cells.map((c) => c.y));
  return { w: maxX + 1, h: maxY + 1 };
}
