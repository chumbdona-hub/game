import Phaser from "phaser";
import { AudioManager } from "../../../core/audio/AudioManager";
import {
  GRID_SIZE,
  GRID_CELLS,
  bombClear,
  canPlace,
  cloneRun,
  isAdventureComplete,
  isAdventureFailed,
  isGameOver,
  newRun,
  placeFromTray,
  tryUndo,
  pieceCells,
  type RunState,
  type TrayPiece,
} from "../logic/prismLogic";

export interface PrismDropSceneCallbacks {
  onRunUpdate: (run: RunState) => void;
  onGameOver: (finalRun: RunState) => void;
  onVictory: (finalRun: RunState, stars: number) => void;
}

export class PrismDropScene extends Phaser.Scene {
  private run: RunState = newRun({ seed: 1, mode: "classic" });

  private reducedMotion = false;
  private cb: PrismDropSceneCallbacks;

  private gridOrigin = { x: 0, y: 0 };
  private cell = 48;

  private gridSprites: Phaser.GameObjects.Image[] = [];
  private gridBg!: Phaser.GameObjects.Graphics;

  private traySlots: Array<{ x: number; y: number }> = [];
  private trayContainers: Array<Phaser.GameObjects.Container | null> = [null, null, null];
  private selectedIndex = 0;

  private dragging:
    | {
        index: number;
        container: Phaser.GameObjects.Container;
        homeX: number;
        homeY: number;
        offsetX: number;
        offsetY: number;
      }
    | null = null;

  private ghost: Phaser.GameObjects.Image[] = [];

  private bombMode = false;
  private bombHighlight!: Phaser.GameObjects.Graphics;

  private particles!: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor({ reducedMotion, ...cb }: PrismDropSceneCallbacks & { reducedMotion: boolean }) {
    super("PrismDrop");
    this.reducedMotion = reducedMotion;
    this.cb = cb;
  }

  setRun(run: RunState) {
    this.run = cloneRun(run);
    this.bombMode = false;
    this.dragging = null;
    this.selectedIndex = 0;
    if (this.scene.isActive()) {
      this.refreshAll();
      this.emitUpdate();
    }
  }

  getRunClone() {
    return cloneRun(this.run);
  }

  canUndo() {
    return !!this.run.undo;
  }

  undo() {
    const ok = tryUndo(this.run);
    if (ok) {
      this.refreshAll();
      this.emitUpdate();
      AudioManager.instance.play("ui_click");
    }
    return ok;
  }

  rotateSelected() {
    const p = this.run.tray[this.selectedIndex];
    if (!p) return false;
    p.rot = (p.rot + 1) % 4;
    this.refreshTray();
    this.emitUpdate();
    AudioManager.instance.play("ui_click");
    return true;
  }

  beginBombMode() {
    this.bombMode = true;
    AudioManager.instance.play("ui_click");
  }

  create() {
    this.createTextures();

    this.gridBg = this.add.graphics();
    this.bombHighlight = this.add.graphics();

    this.particles = this.add.particles(0, 0, "spark", {
      speed: { min: 40, max: 160 },
      scale: { start: 0.7, end: 0 },
      lifespan: 420,
      quantity: 0,
      emitting: false,
      blendMode: Phaser.BlendModes.ADD,
    });

    // Create 64 sprites up-front (object pooling friendly)
    for (let i = 0; i < GRID_CELLS; i++) {
      const img = this.add.image(0, 0, "block0");
      img.setVisible(false);
      this.gridSprites.push(img);
    }

    this.input.on("pointerdown", this.onPointerDown, this);
    this.input.on("pointermove", this.onPointerMove, this);
    this.input.on("pointerup", this.onPointerUp, this);

    this.scale.on("resize", () => this.layout());
    this.layout();
    this.refreshAll();
    this.emitUpdate();
  }

  private createTextures() {
    const palette = [
      0x22d3ee, // cyan
      0xa78bfa, // violet
      0x34d399, // green
      0xfb7185, // rose
      0xfbbf24, // amber
      0x60a5fa, // blue
    ];

    palette.forEach((c, i) => {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(c, 1);
      g.fillRoundedRect(0, 0, 64, 64, 10);
      g.lineStyle(4, 0xffffff, 0.22);
      g.strokeRoundedRect(2, 2, 60, 60, 10);
      g.fillStyle(0xffffff, 0.12);
      g.fillRoundedRect(8, 8, 48, 20, 8);
      g.generateTexture(`block${i}`, 64, 64);
      g.destroy();
    });

    const spark = this.make.graphics({ x: 0, y: 0 });
    spark.fillStyle(0xffffff, 1);
    spark.fillCircle(6, 6, 6);
    spark.generateTexture("spark", 12, 12);
    spark.destroy();
  }

  private layout() {
    const w = this.scale.width;
    const h = this.scale.height;

    // Reserve tray area at bottom.
    const trayH = Math.max(140, h * 0.22);
    const topPad = 84;
    const gridAreaH = Math.max(240, h - trayH - topPad);

    const maxCellW = Math.floor((w - 32) / GRID_SIZE);
    const maxCellH = Math.floor((gridAreaH - 24) / GRID_SIZE);
    this.cell = Math.max(26, Math.min(64, Math.min(maxCellW, maxCellH)));

    const gridW = this.cell * GRID_SIZE;
    const gridH = this.cell * GRID_SIZE;

    this.gridOrigin.x = Math.floor((w - gridW) / 2);
    this.gridOrigin.y = Math.floor(topPad + (gridAreaH - gridH) / 2);

    // Position grid sprites
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const idx = y * GRID_SIZE + x;
        const img = this.gridSprites[idx];
        img.setPosition(
          this.gridOrigin.x + x * this.cell + this.cell / 2,
          this.gridOrigin.y + y * this.cell + this.cell / 2
        );
        img.setDisplaySize(this.cell - 4, this.cell - 4);
      }
    }

    // Draw grid background
    this.gridBg.clear();
    this.gridBg.fillStyle(0xffffff, 0.03);
    this.gridBg.fillRoundedRect(this.gridOrigin.x - 10, this.gridOrigin.y - 10, gridW + 20, gridH + 20, 18);
    this.gridBg.lineStyle(2, 0xffffff, 0.08);
    this.gridBg.strokeRoundedRect(this.gridOrigin.x - 10, this.gridOrigin.y - 10, gridW + 20, gridH + 20, 18);

    this.gridBg.lineStyle(1, 0xffffff, 0.06);
    for (let i = 1; i < GRID_SIZE; i++) {
      const gx = this.gridOrigin.x + i * this.cell;
      const gy = this.gridOrigin.y + i * this.cell;
      this.gridBg.lineBetween(gx, this.gridOrigin.y, gx, this.gridOrigin.y + gridH);
      this.gridBg.lineBetween(this.gridOrigin.x, gy, this.gridOrigin.x + gridW, gy);
    }

    // Tray slots
    const slotY = h - trayH / 2;
    this.traySlots = [0, 1, 2].map((i) => ({ x: (w * (i + 1)) / 4, y: slotY }));

    this.refreshTrayPositions();
  }

  private refreshAll() {
    this.refreshGrid();
    this.refreshTray(true);
    this.refreshGhost(null);
  }

  private refreshGrid() {
    for (let i = 0; i < GRID_CELLS; i++) {
      const v = this.run.grid[i];
      const img = this.gridSprites[i];
      if (v === -1) {
        img.setVisible(false);
      } else {
        img.setTexture(`block${v % 6}`);
        img.setVisible(true);
        img.setAlpha(1);
        img.setScale(1);
      }
    }
  }

  private refreshTray(forceRecreate = false) {
    for (let i = 0; i < 3; i++) {
      const piece = this.run.tray[i];
      const existing = this.trayContainers[i];
      if (!piece) {
        existing?.destroy();
        this.trayContainers[i] = null;
        continue;
      }
      if (!existing || forceRecreate) {
        existing?.destroy();
        this.trayContainers[i] = this.buildPieceContainer(piece, i);
      } else {
        // Rebuild children for rotation changes.
        existing.removeAll(true);
        this.populatePieceContainer(existing, piece);
      }

      const c = this.trayContainers[i]!;
      c.setDepth(i === this.selectedIndex ? 10 : 5);
      c.setAlpha(i === this.selectedIndex ? 1 : 0.92);
    }

    this.refreshTrayPositions();
  }

  private refreshTrayPositions() {
    for (let i = 0; i < 3; i++) {
      const c = this.trayContainers[i];
      if (!c) continue;
      const s = this.traySlots[i];
      c.setPosition(s.x, s.y);
    }
  }

  private buildPieceContainer(piece: TrayPiece, index: number) {
    const c = this.add.container(0, 0);
    c.setSize(this.cell * 4, this.cell * 4);
    c.setInteractive(new Phaser.Geom.Rectangle(-100, -100, 200, 200), Phaser.Geom.Rectangle.Contains);
    c.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (this.bombMode) return;
      this.selectedIndex = index;
      this.refreshTray();
      const isTouch = isTouchPointer(pointer);
      const offsetY = isTouch ? -this.cell * 2.2 : 0;
      this.dragging = {
        index,
        container: c,
        homeX: this.traySlots[index].x,
        homeY: this.traySlots[index].y,
        offsetX: 0,
        offsetY,
      };
      c.setDepth(20);
      AudioManager.instance.play("ui_click");
    });

    this.populatePieceContainer(c, piece);
    return c;
  }

  private populatePieceContainer(container: Phaser.GameObjects.Container, piece: TrayPiece) {
    const cells = pieceCells(piece);
    const maxX = Math.max(...cells.map((p) => p.x));
    const maxY = Math.max(...cells.map((p) => p.y));
    const w = (maxX + 1) * this.cell;
    const h = (maxY + 1) * this.cell;

    // Center within container at (0,0) origin by shifting negative half.
    const ox = -w / 2 + this.cell / 2;
    const oy = -h / 2 + this.cell / 2;

    for (const c of cells) {
      const img = this.add.image(ox + c.x * this.cell, oy + c.y * this.cell, `block${piece.color % 6}`);
      img.setDisplaySize(this.cell - 6, this.cell - 6);
      container.add(img);
    }

    // subtle slot plate
    const plate = this.add.graphics();
    plate.fillStyle(0x000000, 0.25);
    plate.fillRoundedRect(-w / 2 - 12, -h / 2 - 12, w + 24, h + 24, 18);
    plate.lineStyle(2, 0xffffff, this.selectedIndex === this.trayContainers.indexOf(container) ? 0.14 : 0.08);
    plate.strokeRoundedRect(-w / 2 - 12, -h / 2 - 12, w + 24, h + 24, 18);
    container.addAt(plate, 0);
  }

  private onPointerDown(pointer: Phaser.Input.Pointer) {
    if (!this.bombMode) return;
    const cell = this.pointerToGrid(pointer.worldX, pointer.worldY);
    if (!cell) return;

    this.bombMode = false;
    const res = bombClear(this.run, cell.gx, cell.gy);
    if (res.bombed.length > 0 || res.clearedCells.length > 0) {
      AudioManager.instance.play("clear");
      this.fxBurst(res.bombed.concat(res.clearedCells));
      if (!this.reducedMotion) this.cameras.main.shake(120, 0.008);
      this.refreshGrid();
      this.emitUpdate();
    }

    if (isAdventureComplete(this.run)) {
      this.cb.onVictory(cloneRun(this.run), starsFromAdventure(this.run));
      return;
    }
    if (isAdventureFailed(this.run) || isGameOver(this.run.grid, this.run.tray)) {
      AudioManager.instance.play("game_over");
      this.cb.onGameOver(cloneRun(this.run));
    }
  }

  private onPointerMove(pointer: Phaser.Input.Pointer) {
    // bomb highlight
    if (this.bombMode) {
      const cell = this.pointerToGrid(pointer.worldX, pointer.worldY);
      this.drawBombHighlight(cell);
      return;
    }

    if (!this.dragging) return;
    const d = this.dragging;
    d.container.x = pointer.worldX + d.offsetX;
    d.container.y = pointer.worldY + d.offsetY;

    const snap = this.containerToGridSnap(d.container.x, d.container.y);
    this.refreshGhost(snap);
  }

  private onPointerUp() {
    if (!this.dragging) return;
    const d = this.dragging;
    const snap = this.containerToGridSnap(d.container.x, d.container.y);

    const piece = this.run.tray[d.index];
    if (piece && snap && canPlace(this.run.grid, piece, snap.gx, snap.gy)) {
      const res = placeFromTray(this.run, d.index, snap.gx, snap.gy);
      AudioManager.instance.play("place");

      this.refreshTray(true);
      this.refreshGrid();

      if (res.clearedLines > 0) {
        AudioManager.instance.play("clear");
        this.fxClear(res.clearedCells);
        if (!this.reducedMotion) this.cameras.main.shake(120, 0.01 + res.clearedLines * 0.003);
      }

      this.emitUpdate();

      if (isAdventureComplete(this.run)) {
        this.cb.onVictory(cloneRun(this.run), starsFromAdventure(this.run));
        return;
      }
      if (res.gameOver) {
        AudioManager.instance.play("game_over");
        this.cb.onGameOver(cloneRun(this.run));
        return;
      }
    } else {
      // Return home
      this.tweens.add({
        targets: d.container,
        x: d.homeX,
        y: d.homeY,
        duration: this.reducedMotion ? 1 : 140,
        ease: "Sine.Out",
      });
    }

    d.container.setDepth(10);
    this.dragging = null;
    this.refreshGhost(null);
  }

  private emitUpdate() {
    this.cb.onRunUpdate(cloneRun(this.run));
  }

  private pointerToGrid(x: number, y: number): { gx: number; gy: number } | null {
    const gx = Math.floor((x - this.gridOrigin.x) / this.cell);
    const gy = Math.floor((y - this.gridOrigin.y) / this.cell);
    if (gx < 0 || gy < 0 || gx >= GRID_SIZE || gy >= GRID_SIZE) return null;
    return { gx, gy };
  }

  private containerToGridSnap(x: number, y: number): { gx: number; gy: number } | null {
    // Container position is centered; estimate top-left origin snap by rounding.
    const gx = Math.round((x - this.gridOrigin.x) / this.cell);
    const gy = Math.round((y - this.gridOrigin.y) / this.cell);
    if (gx < -2 || gy < -2 || gx > GRID_SIZE || gy > GRID_SIZE) return null;
    return { gx, gy };
  }

  private refreshGhost(snap: { gx: number; gy: number } | null) {
    // Hide all
    for (const g of this.ghost) g.setVisible(false);
    if (!this.dragging) return;

    const piece = this.run.tray[this.dragging.index];
    if (!piece || !snap) return;

    const cells = pieceCells(piece);
    const ok = canPlace(this.run.grid, piece, snap.gx, snap.gy);

    const needed = cells.length;
    while (this.ghost.length < needed) {
      const img = this.add.image(0, 0, "block0");
      img.setAlpha(0.35);
      img.setDepth(15);
      this.ghost.push(img);
    }

    for (let i = 0; i < needed; i++) {
      const c = cells[i];
      const x = snap.gx + c.x;
      const y = snap.gy + c.y;
      const img = this.ghost[i];
      img.setTexture(`block${piece.color % 6}`);
      img.setDisplaySize(this.cell - 6, this.cell - 6);
      img.setPosition(
        this.gridOrigin.x + x * this.cell + this.cell / 2,
        this.gridOrigin.y + y * this.cell + this.cell / 2
      );
      img.setTint(ok ? 0xffffff : 0xff4d6d);
      img.setVisible(x >= 0 && y >= 0 && x < GRID_SIZE && y < GRID_SIZE);
    }
  }

  private drawBombHighlight(cell: { gx: number; gy: number } | null) {
    this.bombHighlight.clear();
    if (!cell) return;

    this.bombHighlight.lineStyle(3, 0xfb7185, 0.7);
    const x = this.gridOrigin.x + cell.gx * this.cell;
    const y = this.gridOrigin.y + cell.gy * this.cell;
    this.bombHighlight.strokeRoundedRect(x + 3, y + 3, this.cell - 6, this.cell - 6, 10);
  }

  private fxClear(cells: { x: number; y: number }[]) {
    // Pop animation on cleared cells
    for (const c of cells) {
      const idx = c.y * GRID_SIZE + c.x;
      const img = this.gridSprites[idx];
      if (!img.visible) continue;
      this.tweens.add({
        targets: img,
        alpha: 0,
        scale: 0.3,
        duration: this.reducedMotion ? 1 : 120,
        ease: "Back.In",
        onComplete: () => {
          img.setVisible(false);
          img.setAlpha(1);
          img.setScale(1);
        },
      });
    }

    this.fxBurst(cells);
  }

  private fxBurst(cells: { x: number; y: number }[]) {
    if (!cells.length) return;
    const qty = this.reducedMotion ? 6 : 12;
    for (const c of cells) {
      const px = this.gridOrigin.x + c.x * this.cell + this.cell / 2;
      const py = this.gridOrigin.y + c.y * this.cell + this.cell / 2;
      (this.particles as any).emitParticleAt(px, py, qty);
    }
  }
}

function isTouchPointer(pointer: Phaser.Input.Pointer) {
  const e = pointer.event as any;
  const pt = e?.pointerType;
  return pt === "touch" || !!e?.touches || !!e?.changedTouches;
}

function starsFromAdventure(run: RunState) {
  if (!run.adventure) return 0;
  const ratio = run.adventure.movesUsed / Math.max(1, run.adventure.maxMoves);
  if (ratio <= 0.55) return 3;
  if (ratio <= 0.8) return 2;
  return 1;
}
