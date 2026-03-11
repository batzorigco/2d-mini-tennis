import { PHYSICS } from "./constants";
// ── Ball movement ───────────────────────────────────────
export function updateBall(ball) {
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
export function calcArcVz(startZ, from, to, speed) {
    const dist = distance(from, to);
    const frames = dist / Math.max(speed, 0.1);
    if (frames <= 1)
        return 0;
    // z(T) = startZ + vz*T - 0.5*g*T² = 0
    // vz = (0.5*g*T² - startZ) / T
    return (0.5 * PHYSICS.BALL_GRAVITY * frames * frames - startZ) / frames;
}
// ── Velocity helpers ────────────────────────────────────
export function calcVelocity(from, to, speed) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist === 0)
        return { x: 0, y: -speed };
    return { x: (dx / dist) * speed, y: (dy / dist) * speed };
}
export function distance(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}
export function magnitude(v) {
    return Math.sqrt(v.x * v.x + v.y * v.y);
}
// ── Bounds checking ─────────────────────────────────────
export function isInServiceBox(pos, court, targetSide, targetBox) {
    const mid = court.centerServiceX;
    let boxLeft, boxRight, boxTop, boxBottom;
    if (targetSide === "far") {
        boxTop = court.serviceLineFar;
        boxBottom = court.netY;
    }
    else {
        boxTop = court.netY;
        boxBottom = court.serviceLineNear;
    }
    if (targetBox === "left") {
        boxLeft = court.singlesLeft;
        boxRight = mid;
    }
    else {
        boxLeft = mid;
        boxRight = court.singlesRight;
    }
    return (pos.x >= boxLeft &&
        pos.x <= boxRight &&
        pos.y >= boxTop &&
        pos.y <= boxBottom);
}
export function isOnSide(pos, court, side) {
    if (side === "near") {
        return pos.y > court.netY;
    }
    return pos.y < court.netY;
}
export function ballOutOfCourt(ball, court) {
    return (ball.pos.y < court.y - 60 ||
        ball.pos.y > court.y + court.height + 60 ||
        ball.pos.x < court.x - 60 ||
        ball.pos.x > court.x + court.width + 60);
}
export function isInSingles(pos, court) {
    return (pos.x >= court.singlesLeft &&
        pos.x <= court.singlesRight &&
        pos.y >= court.y &&
        pos.y <= court.y + court.height);
}
//# sourceMappingURL=physics.js.map