import type { Ball, Vec2, CourtDimensions } from "./types";
import { CANVAS_WIDTH, CANVAS_HEIGHT, PHYSICS } from "./constants";

// ── Ball movement ───────────────────────────────────────

export function updateBall(ball: Ball): void {
  ball.pos.x += ball.vel.x;
  ball.pos.y += ball.vel.y;

  ball.z += ball.vz;
  ball.vz -= PHYSICS.BALL_GRAVITY;

  // For non-in-play balls (toss idle, etc), hard stop at ground
  if (ball.z < 0 && !ball.isInPlay) {
    ball.z = 0;
    ball.vz = 0;
  }

  ball.shadow.x = ball.pos.x;
  ball.shadow.y = ball.pos.y;
}

// ── Calculate arc vz so ball lands at target ────────────

export function calcArcVz(
  startZ: number,
  from: Vec2,
  to: Vec2,
  speed: number,
): number {
  const dist = distance(from, to);
  const frames = dist / Math.max(speed, 0.1);
  if (frames <= 1) return 0;
  // z(T) = startZ + vz*T - 0.5*g*T² = 0
  // vz = (0.5*g*T² - startZ) / T
  return (0.5 * PHYSICS.BALL_GRAVITY * frames * frames - startZ) / frames;
}

// ── Velocity helpers ────────────────────────────────────

export function calcVelocity(from: Vec2, to: Vec2, speed: number): Vec2 {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist === 0) return { x: 0, y: -speed };
  return { x: (dx / dist) * speed, y: (dy / dist) * speed };
}

export function distance(a: Vec2, b: Vec2): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function magnitude(v: Vec2): number {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

// ── Bounds checking ─────────────────────────────────────

export function isInServiceBox(
  pos: Vec2,
  court: CourtDimensions,
  targetSide: "near" | "far",
  targetBox: "left" | "right",
): boolean {
  const mid = court.centerServiceX;
  let boxLeft: number, boxRight: number, boxTop: number, boxBottom: number;

  if (targetSide === "far") {
    boxTop = court.serviceLineFar;
    boxBottom = court.netY;
  } else {
    boxTop = court.netY;
    boxBottom = court.serviceLineNear;
  }

  if (targetBox === "left") {
    boxLeft = court.singlesLeft;
    boxRight = mid;
  } else {
    boxLeft = mid;
    boxRight = court.singlesRight;
  }

  return (
    pos.x >= boxLeft &&
    pos.x <= boxRight &&
    pos.y >= boxTop &&
    pos.y <= boxBottom
  );
}

export function isOnSide(
  pos: Vec2,
  court: CourtDimensions,
  side: "near" | "far",
): boolean {
  if (side === "near") {
    return pos.y > court.netY;
  }
  return pos.y < court.netY;
}

export function ballOutOfCourt(ball: Ball, _court: CourtDimensions): boolean {
  return (
    ball.pos.y < -20 ||
    ball.pos.y > CANVAS_HEIGHT + 20 ||
    ball.pos.x < -20 ||
    ball.pos.x > CANVAS_WIDTH + 20
  );
}

export function isInSingles(pos: Vec2, court: CourtDimensions): boolean {
  return (
    pos.x >= court.singlesLeft &&
    pos.x <= court.singlesRight &&
    pos.y >= court.y &&
    pos.y <= court.y + court.height
  );
}
