// ── Canvas ──────────────────────────────────────────────
export const CANVAS_WIDTH = 480;
export const CANVAS_HEIGHT = 800;
// ── Court ───────────────────────────────────────────────
export const COURT = {
    MARGIN_X: 84,
    MARGIN_TOP: 140,
    MARGIN_BOTTOM: 140,
    WIDTH: 312, // 0.6 aspect ratio (312/520)
    HEIGHT: 520,
    ALLEY_RATIO: 0.125, // doubles alley: 4.5ft / 36ft per side
    SERVICE_LINE_RATIO: 0.54, // service line 21ft from net / 39ft half-court
    LINE_WIDTH: 2,
    NET_COLOR: "#CCCCCC",
    NET_WIDTH: 3,
};
// ── Surface themes ─────────────────────────────────────
export const SURFACES = {
    "us-open": {
        court: "#6C935C",
        clearSpace: "#3C638E",
        line: "#FFFFFF",
    },
    "roland-garros": {
        court: "#D1581F",
        clearSpace: "#D1581F",
        line: "#FAEDDD",
    },
    wimbledon: {
        court: "#536D33",
        clearSpace: "#536D33",
        line: "#FFFFFF",
    },
    "aus-open": {
        court: "#377EB8",
        clearSpace: "#1E8FD5",
        line: "#E8F8FF",
    },
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
    // Volley & smash z-height thresholds
    VOLLEY_MAX_Z: 15, // ball at or below this z = volley (low interception)
    SMASH_MAX_Z: 35, // ball above VOLLEY_MAX_Z but below this = smash (overhead)
    // above SMASH_MAX_Z = unreachable, ball passes over
    // Hit speeds by type
    BALL_SPEED_VOLLEY: 3.5, // volleys are placed, less power
    BALL_SPEED_SMASH: 5.5, // smashes are aggressive overhead slams
};
//# sourceMappingURL=constants.js.map