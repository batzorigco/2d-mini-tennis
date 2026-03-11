// ── Core types ──────────────────────────────────────────

export interface Vec2 {
  x: number;
  y: number;
}

// ── Ball ────────────────────────────────────────────────

export interface Ball {
  pos: Vec2;
  vel: Vec2;
  z: number; // height above court (0 = ground)
  vz: number; // vertical velocity
  radius: number;
  shadow: Vec2;
  isInPlay: boolean;
  lastHitBy: "player" | "bot" | null;
  hasBounced: boolean; // has the ball bounced on receiver's side
}

// ── Player ──────────────────────────────────────────────

export interface Player {
  pos: Vec2;
  radius: number;
  color: string;
  side: "near" | "far"; // near = bottom (player), far = top (bot)
  swingTimer: number; // counts down from SWING_DURATION → 0 for hit animation
}

// ── Score ───────────────────────────────────────────────

export interface Score {
  player: number; // 0, 15, 30, 40
  bot: number;
  playerGames: number;
  botGames: number;
  isDeuce: boolean;
  advantage: "player" | "bot" | null;
  servingSide: "player" | "bot";
  serviceBox: "left" | "right";
  serveAttempt: 1 | 2; // first or second serve
}

// ── Serve ───────────────────────────────────────────────

export type ServePhase = "idle" | "tossing" | "aiming" | "fired";

export interface ServeState {
  phase: ServePhase;
  tossProgress: number;
  aimTarget: Vec2 | null;
  aimTimer: number; // increments during SERVE_AIM for sweeping cursor
}

// ── Game phases ─────────────────────────────────────────

export type GamePhase =
  | "IDLE"
  | "SERVE_SETUP"
  | "SERVE_TOSS"
  | "SERVE_AIM"
  | "SERVE_FIRE"
  | "FAULT"
  | "RALLY"
  | "POINT_SCORED"
  | "GAME_OVER";

// ── Court ───────────────────────────────────────────────

export interface CourtDimensions {
  x: number;
  y: number;
  width: number;
  height: number;
  netY: number;
  serviceLineNear: number;
  serviceLineFar: number;
  centerServiceX: number;
  singlesLeft: number;
  singlesRight: number;
}

// ── Full game state ─────────────────────────────────────

export interface GameState {
  phase: GamePhase;
  ball: Ball;
  player: Player;
  bot: Player;
  score: Score;
  serve: ServeState;
  court: CourtDimensions;
  mousePos: Vec2;
  lastPointWinner: "player" | "bot" | null;
  pointPauseTimer: number;
  botServeTimer: number; // countdown for bot auto-serve
  faultMessage: string | null; // "FAULT" or "DOUBLE FAULT" display
  faultTimer: number;
}
