import { PHYSICS } from "./constants";
import { calcVelocity, calcArcVz, distance } from "./physics";
// ── Bot movement AI ──────────────────────────────────────
export function updateBot(state) {
    const bot = state.bot;
    const ball = state.ball;
    const court = state.court;
    // Default idle position: center of far half
    let target = {
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
        }
        else {
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
export function botTryHit(state) {
    const bot = state.bot;
    const ball = state.ball;
    const court = state.court;
    if (!ball.isInPlay)
        return false;
    if (ball.lastHitBy === "bot")
        return false;
    // Ball must be on bot's side and near ground (bounced)
    if (ball.pos.y > court.netY)
        return false;
    if (ball.z > 8)
        return false;
    if (!ball.hasBounced)
        return false;
    const dist = distance(bot.pos, ball.pos);
    if (dist > PHYSICS.HIT_RADIUS)
        return false;
    // Pick a target on the player's side
    const target = botPickRallyTarget(state);
    ball.vel = calcVelocity(ball.pos, target, PHYSICS.BALL_SPEED_RALLY);
    ball.vz = calcArcVz(ball.z, ball.pos, target, PHYSICS.BALL_SPEED_RALLY);
    ball.lastHitBy = "bot";
    ball.hasBounced = false;
    state.bot.swingTimer = PHYSICS.SWING_DURATION;
    return true;
}
// ── Bot rally target ─────────────────────────────────────
function botPickRallyTarget(state) {
    const court = state.court;
    const player = state.player;
    // Aim away from the player with some randomness
    const courtMidX = court.centerServiceX;
    const aimX = player.pos.x > courtMidX
        ? court.singlesLeft + 20 + Math.random() * 60
        : court.singlesRight - 20 - Math.random() * 60;
    const aimY = court.serviceLineNear +
        Math.random() * (court.y + court.height - court.serviceLineNear - 20);
    return { x: aimX, y: aimY };
}
//# sourceMappingURL=bot.js.map