// ── Canvas ──────────────────────────────────────────────

export const CANVAS_WIDTH = 480;
export const CANVAS_HEIGHT = 720;

// ── Court ───────────────────────────────────────────────

export const COURT = {
  MARGIN_X: 72,
  MARGIN_TOP: 120,
  MARGIN_BOTTOM: 120,
  WIDTH: 336, // 280 * 1.2
  HEIGHT: 480, // 600 * 0.8
  ALLEY_RATIO: 0.125, // doubles alley: 4.5ft / 36ft per side
  SERVICE_LINE_RATIO: 0.54, // service line 21ft from net / 39ft half-court

  // Colors
  SURFACE_COLOR: "#2D6B3F",
  LINE_COLOR: "#FFFFFF",
  LINE_WIDTH: 2,
  NET_COLOR: "#CCCCCC",
  NET_WIDTH: 3,
  OUT_COLOR: "#1A4028",
};

// ── Ball ────────────────────────────────────────────────

export const BALL = {
  RADIUS: 5,
  COLOR: "#CCFF00",
  STROKE_COLOR: "#99AA00",
  SHADOW_COLOR: "rgba(0,0,0,0.25)",
};

// ── Players ─────────────────────────────────────────────

export const PLAYER = {
  RADIUS: 12,
  COLOR: "#4488FF",
  BOT_COLOR: "#FF4444",
  STROKE_COLOR: "rgba(0,0,0,0.3)",
};

// ── Physics ─────────────────────────────────────────────

export const PHYSICS = {
  BALL_SPEED_SERVE: 5,
  BALL_SPEED_RALLY: 4,
  BALL_GRAVITY: 0.05, // gentle arc during flight
  TOSS_GRAVITY: 0.25, // fast toss animation
  TOSS_VELOCITY: 5,
  TOSS_PEAK_Z: 50,
  BOUNCE_VZ: 0.8, // small upward bounce after landing
  BOUNCE_FRICTION: 0.6, // horizontal slowdown on bounce
  PLAYER_LERP: 0.08, // mouse-follow smoothing
  BOT_SPEED: 2.2,
  HIT_RADIUS: 35,
  POINT_PAUSE_FRAMES: 90, // ~1.5s at 60fps
  BOT_SERVE_DELAY: 60, // ~1s before bot auto-serves
  FAULT_PAUSE_FRAMES: 60, // ~1s fault message display
  SERVE_AIM_SPEED_X: 0.022, // horizontal sweep speed (radians/frame)
  SERVE_AIM_SPEED_Y: 0.015, // vertical sweep speed (radians/frame)
  SWING_DURATION: 12, // racket swing animation frames (~200ms at 60fps)
};
