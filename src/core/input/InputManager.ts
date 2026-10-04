export type KeyName =
  | "ArrowUp"
  | "ArrowDown"
  | "ArrowLeft"
  | "ArrowRight"
  | "w"
  | "a"
  | "s"
  | "d"
  | " "
  | "Shift"
  | "Control"
  | "Escape"
  | "Tab"
  | "q"
  | "e"
  | "c"
  | "x";

export class InputManager {
  private keys = new Set<string>();

  constructor(private target: Window | HTMLElement = window) {}

  mount() {
    this.target.addEventListener("keydown", this.onKeyDown as any);
    this.target.addEventListener("keyup", this.onKeyUp as any);
  }

  unmount() {
    this.target.removeEventListener("keydown", this.onKeyDown as any);
    this.target.removeEventListener("keyup", this.onKeyUp as any);
    this.keys.clear();
  }

  isDown(key: KeyName) {
    return this.keys.has(key) || this.keys.has(key.toUpperCase());
  }

  private onKeyDown = (e: KeyboardEvent) => {
    this.keys.add(e.key);
  };
  private onKeyUp = (e: KeyboardEvent) => {
    this.keys.delete(e.key);
  };
}
