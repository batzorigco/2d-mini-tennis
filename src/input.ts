import type { Vec2 } from "./types";

export interface InputState {
  mousePos: Vec2;
  mouseClicked: boolean; // true for one frame per click
  mouseDown: boolean;
  joystickActive: boolean;
  joystickDir: Vec2; // normalized direction (-1 to 1)
  joystickForce: number; // 0 to 1
}

export function createInputHandlers(canvas: HTMLCanvasElement) {
  const state: InputState = {
    mousePos: { x: 0, y: 0 },
    mouseClicked: false,
    mouseDown: false,
    joystickActive: false,
    joystickDir: { x: 0, y: 0 },
    joystickForce: 0,
  };

  function toCanvasMouse(e: MouseEvent): Vec2 {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  function toCanvasTouch(t: Touch): Vec2 {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (t.clientX - rect.left) * scaleX,
      y: (t.clientY - rect.top) * scaleY,
    };
  }

  // Mouse events
  const onMove = (e: MouseEvent) => {
    state.mousePos = toCanvasMouse(e);
  };
  const onDown = (e: MouseEvent) => {
    state.mousePos = toCanvasMouse(e);
    state.mouseDown = true;
    state.mouseClicked = true;
  };
  const onUp = () => {
    state.mouseDown = false;
  };

  // Touch events
  const onTouchStart = (e: TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    if (touch) {
      state.mousePos = toCanvasTouch(touch);
      state.mouseDown = true;
      state.mouseClicked = true;
    }
  };
  const onTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    if (touch) {
      state.mousePos = toCanvasTouch(touch);
    }
  };
  const onTouchEnd = (e: TouchEvent) => {
    e.preventDefault();
    state.mouseDown = false;
  };

  canvas.addEventListener("mousemove", onMove);
  canvas.addEventListener("mousedown", onDown);
  canvas.addEventListener("mouseup", onUp);
  canvas.addEventListener("touchstart", onTouchStart, { passive: false });
  canvas.addEventListener("touchmove", onTouchMove, { passive: false });
  canvas.addEventListener("touchend", onTouchEnd, { passive: false });

  return {
    state,
    consumeClick() {
      state.mouseClicked = false;
    },
    cleanup() {
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mousedown", onDown);
      canvas.removeEventListener("mouseup", onUp);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
    },
  };
}

// ── Virtual joystick (nipplejs) ───────────────────────────

export function setupJoystick(
  container: HTMLElement,
  state: InputState,
): () => void {
  // Dynamic import to avoid SSR issues
  let cleanup = () => {};

  import("nipplejs").then((nipplejs) => {
    const manager = nipplejs.create({
      zone: container,
      mode: "static",
      position: { right: "50%", bottom: "50%" },
      size: 100,
      color: "rgba(255,255,255,0.5)",
    });

    manager.on("move", (_evt, data) => {
      if (data.vector) {
        state.joystickActive = true;
        state.joystickDir.x = data.vector.x;
        state.joystickDir.y = -data.vector.y; // nipplejs y is inverted
        state.joystickForce = Math.min(data.force, 1);
      }
    });

    manager.on("end", () => {
      state.joystickActive = false;
      state.joystickDir.x = 0;
      state.joystickDir.y = 0;
      state.joystickForce = 0;
    });

    cleanup = () => manager.destroy();
  });

  return () => cleanup();
}
