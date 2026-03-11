import type { GameState, Vec2 } from "./types";
import { PHYSICS } from "./constants";
import { calcVelocity, calcArcVz, distance } from "./physics";

// ── Bot movement AI ──────────────────────────────────────

export function updateBot(state: GameState): void {
  const bot = state.bot;
  const ball = state.ball;
  const court = state.court;

  // Default idle position: center of far half
  let target: Vec2 = {
    x: court.centerServiceX,
    y: court.y + court.height * 0.2,
  };

  if (ball.isInPlay) {
    // Chase ball when it's headed toward the bot's side
    if (ball.vel.y < 0) {
      // Predict where ball will be
      const timeToReach = Math.abs(bot.pos.y - ball.pos.y) / Math.abs(ball.vel.y || 1);
      target = {
        x: ball.pos.x + ball.vel.x * timeToReach * 0.6,
        y: ball.pos.y + ball.vel.y * timeToReach * 0.4,
      };
    } else {
      // Ball going away — return to ready position
      target = {
        x: court.centerServiceX,
        y: court.y + court.height * 0.22,
      };
    }
  }

  // Clamp target within bot's playable area
  target.x = Math.max(court.singlesLeft, Math.min(court.singlesRight, target.x));
  target.y = Math.max(court.y + 10, Math.min(court.netY - 15, target.y));

  // Move toward target at bot speed
  const dx = target.x - bot.pos.x;
  const dy = target.y - bot.pos.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist > 1) {
    const speed = Math.min(PHYSICS.BOT_SPEED, dist);
    bot.pos.x += (dx / dist) * speed;
    bot.pos.y += (dy / dist) * speed;
  }
}

// ── Bot hit decision ─────────────────────────────────────

export function botTryHit(state: GameState): boolean {
  const bot = state.bot;
  const ball = state.ball;
  const court = state.court;

  if (!ball.isInPlay) return false;
  if (ball.lastHitBy === "bot") return false;

  // Ball must be on bot's side
  if (ball.pos.y > court.netY) return false;

  const dist = distance(bot.pos, ball.pos);
  if (dist > PHYSICS.HIT_RADIUS) return false;

  // Determine hit type based on bounce state and ball height
  let hitType: "ground" | "volley" | "smash" | null = null;

  if (ball.hasBounced && ball.z < 8) {
    // Normal ground stroke after bounce
    hitType = "ground";
  } else if (!ball.hasBounced && ball.z <= PHYSICS.VOLLEY_MAX_Z) {
    // Volley — intercept before bounce, ball is low
    hitType = "volley";
  } else if (
    !ball.hasBounced &&
    ball.z > PHYSICS.VOLLEY_MAX_Z &&
    ball.z <= PHYSICS.SMASH_MAX_Z
  ) {
    // Smash — overhead hit
    hitType = "smash";
  }

  if (!hitType) return false;

  // Speed depends on hit type
  let speed = PHYSICS.BALL_SPEED_RALLY;
  if (hitType === "volley") speed = PHYSICS.BALL_SPEED_VOLLEY;
  if (hitType === "smash") speed = PHYSICS.BALL_SPEED_SMASH;

  // Pick a target on the player's side
  const target = botPickRallyTarget(state, hitType);
  ball.vel = calcVelocity(ball.pos, target, speed);
  ball.vz = calcArcVz(ball.z, ball.pos, target, speed);
  ball.lastHitBy = "bot";
  ball.hasBounced = false;
  state.bot.swingTimer = PHYSICS.SWING_DURATION;

  return true;
}

// ── Bot rally target ─────────────────────────────────────

function botPickRallyTarget(
  state: GameState,
  hitType: "ground" | "volley" | "smash" = "ground",
): Vec2 {
  const court = state.court;
  const player = state.player;

  // Aim away from the player with some randomness
  const courtMidX = court.centerServiceX;
  const aimX =
    player.pos.x > courtMidX
      ? court.singlesLeft + 20 + Math.random() * 60
      : court.singlesRight - 20 - Math.random() * 60;

  let aimY: number;
  if (hitType === "smash") {
    // Smashes aim shorter — closer to net on player's side
    aimY = court.netY + 20 + Math.random() * (court.serviceLineNear - court.netY - 20);
  } else {
    // Ground strokes and volleys aim deeper
    aimY =
      court.serviceLineNear +
      Math.random() * (court.y + court.height - court.serviceLineNear - 20);
  }

  return { x: aimX, y: aimY };
}
