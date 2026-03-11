import type { GameState, Vec2 } from "./types";
import { PHYSICS } from "./constants";
import { calcVelocity, calcArcVz } from "./physics";

// ── Start the ball toss ─────────────────────────────────

export function startToss(state: GameState): void {
  const server =
    state.score.servingSide === "player" ? state.player : state.bot;

  state.phase = "SERVE_TOSS";
  state.ball.pos = { ...server.pos };
  state.ball.z = 0;
  state.ball.vz = PHYSICS.TOSS_VELOCITY;
  state.ball.vel = { x: 0, y: 0 };
  state.ball.isInPlay = false;
  state.ball.hasBounced = false;
  state.ball.lastHitBy = null;
  state.serve.phase = "tossing";
  state.serve.tossProgress = 0;
}

// ── Update toss animation ───────────────────────────────

export function updateToss(state: GameState): void {
  state.ball.z += state.ball.vz;
  state.ball.vz -= PHYSICS.TOSS_GRAVITY;
  state.serve.tossProgress = Math.min(
    1,
    state.ball.z / PHYSICS.TOSS_PEAK_Z,
  );

  // Toss peaked — switch to aiming
  if (state.ball.vz <= 0 && state.ball.z > 0) {
    if (state.score.servingSide === "player") {
      state.phase = "SERVE_AIM";
      state.serve.phase = "aiming";
      state.serve.aimTimer = Math.random() * 100; // random start position
    } else {
      // Bot auto-aims
      const target = botPickServeTarget(state);
      fireServe(state, target);
    }
  }
}

// ── Get the service box bounds for the current serve ────

export function getServiceBox(state: GameState): {
  left: number;
  right: number;
  top: number;
  bottom: number;
} {
  const court = state.court;
  const mid = court.centerServiceX;
  const box = state.score.serviceBox;
  const servingSide = state.score.servingSide;

  // Server aims into opponent's service box
  const isPlayerServing = servingSide === "player";
  const boxTop = isPlayerServing ? court.serviceLineFar : court.netY;
  const boxBottom = isPlayerServing ? court.netY : court.serviceLineNear;
  const boxLeft = box === "left" ? court.singlesLeft : mid;
  const boxRight = box === "left" ? mid : court.singlesRight;

  return { left: boxLeft, right: boxRight, top: boxTop, bottom: boxBottom };
}

// ── Fire the serve ──────────────────────────────────────

export function fireServe(state: GameState, target: Vec2): void {
  state.phase = "SERVE_FIRE";
  state.serve.phase = "fired";
  state.serve.aimTarget = target;

  state.ball.vel = calcVelocity(
    state.ball.pos,
    target,
    PHYSICS.BALL_SPEED_SERVE,
  );
  state.ball.vz = calcArcVz(
    state.ball.z,
    state.ball.pos,
    target,
    PHYSICS.BALL_SPEED_SERVE,
  );
  state.ball.isInPlay = true;
  state.ball.hasBounced = false;
  state.ball.lastHitBy = state.score.servingSide;
}

// ── Bot picks a random valid serve target ───────────────

function botPickServeTarget(state: GameState): Vec2 {
  const court = state.court;
  const mid = court.centerServiceX;
  const box = state.score.serviceBox;

  // Bot serves into near side (player's service box)
  const boxTop = court.netY;
  const boxBottom = court.serviceLineNear;
  const boxLeft = box === "left" ? court.singlesLeft : mid;
  const boxRight = box === "left" ? mid : court.singlesRight;

  return {
    x: boxLeft + 10 + Math.random() * (boxRight - boxLeft - 20),
    y: boxTop + 10 + Math.random() * (boxBottom - boxTop - 20),
  };
}
