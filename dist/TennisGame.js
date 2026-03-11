"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useRef } from "react";
import { CANVAS_WIDTH, CANVAS_HEIGHT, BALL, PLAYER, PHYSICS } from "./constants";
import { createCourtDimensions, drawCourt } from "./court";
import { createInputHandlers } from "./input";
import { updateBall, calcArcVz, distance, isInServiceBox, isOnSide, ballOutOfCourt, calcVelocity, } from "./physics";
import { startToss, updateToss, getServiceBox, fireServe, } from "./serve";
import { updateBot, botTryHit } from "./bot";
import { createInitialScore, awardPoint, toggleServiceBox, formatPointScore, formatGameScore, } from "./scoring";
// ── Create initial game state ────────────────────────────
function createGameState() {
    const court = createCourtDimensions();
    return {
        phase: "IDLE",
        ball: {
            pos: { x: court.centerServiceX, y: court.netY },
            vel: { x: 0, y: 0 },
            z: 0,
            vz: 0,
            radius: BALL.RADIUS,
            shadow: { x: court.centerServiceX, y: court.netY },
            isInPlay: false,
            lastHitBy: null,
            hasBounced: false,
        },
        player: {
            pos: { x: court.centerServiceX, y: court.y + court.height - 40 },
            radius: PLAYER.RADIUS,
            color: PLAYER.COLOR,
            side: "near",
            swingTimer: 0,
        },
        bot: {
            pos: { x: court.centerServiceX, y: court.y + court.height * 0.2 },
            radius: PLAYER.RADIUS,
            color: PLAYER.BOT_COLOR,
            side: "far",
            swingTimer: 0,
        },
        score: createInitialScore(),
        serve: {
            phase: "idle",
            tossProgress: 0,
            aimTarget: null,
            aimTimer: 0,
        },
        court,
        mousePos: { x: court.centerServiceX, y: court.y + court.height - 40 },
        lastPointWinner: null,
        pointPauseTimer: 0,
        botServeTimer: 0,
        faultMessage: null,
        faultTimer: 0,
    };
}
// ── Setup serve position ─────────────────────────────────
function setupServePosition(state) {
    const court = state.court;
    const isPlayerServing = state.score.servingSide === "player";
    const box = state.score.serviceBox;
    // Server stands on opposite side of target box (cross-court serve)
    const serverX = box === "right"
        ? court.centerServiceX - 40
        : court.centerServiceX + 40;
    if (isPlayerServing) {
        // Player serves from behind near baseline
        state.player.pos = {
            x: serverX,
            y: court.y + court.height + 20,
        };
        // Bot returns from behind far baseline
        state.bot.pos = {
            x: court.centerServiceX,
            y: court.y - 20,
        };
    }
    else {
        // Bot serves from behind far baseline
        state.bot.pos = {
            x: serverX,
            y: court.y - 20,
        };
        // Player returns from behind near baseline
        state.player.pos = {
            x: court.centerServiceX,
            y: court.y + court.height + 20,
        };
    }
}
function isServePhase(phase) {
    return (phase === "SERVE_SETUP" ||
        phase === "SERVE_TOSS" ||
        phase === "SERVE_AIM" ||
        phase === "SERVE_FIRE" ||
        phase === "FAULT");
}
// ── Compute sweeping serve aim cursor ────────────────────
function getServeAimCursor(state) {
    const t = state.serve.aimTimer;
    // Service box bounds + padding
    const box = getServiceBox(state);
    const pad = 40;
    const sweepLeft = box.left - pad;
    const sweepRight = box.right + pad;
    // Pendulum: horizontal sweep with slight vertical drift between passes
    const boxMidY = (box.top + box.bottom) / 2;
    // Main axis: smooth left-right sweep
    const nx = (Math.sin(t * PHYSICS.SERVE_AIM_SPEED_X) + 1) / 2; // 0..1
    const x = sweepLeft + nx * (sweepRight - sweepLeft);
    // Vertical: gentle drift up/down, much slower than horizontal
    // Stays mostly within service box with slight overshoot
    const yDrift = Math.sin(t * PHYSICS.SERVE_AIM_SPEED_Y) * (pad * 0.8);
    const y = boxMidY + yDrift;
    return { x, y };
}
export default function TennisGame({ width, height }) {
    const canvasRef = useRef(null);
    const rafRef = useRef(0);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        // Internal resolution stays fixed; CSS scales to display size
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;
        const ctx = canvas.getContext("2d");
        const state = createGameState();
        const input = createInputHandlers(canvas);
        const loop = () => {
            // Sync input
            state.mousePos = input.state.mousePos;
            // Handle clicks
            if (input.state.mouseClicked) {
                handleClick(state);
                input.consumeClick();
            }
            // Update + draw
            update(state);
            draw(ctx, state);
            rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);
        return () => {
            cancelAnimationFrame(rafRef.current);
            input.cleanup();
        };
    }, []);
    return (_jsx("canvas", { ref: canvasRef, className: "block mx-auto cursor-crosshair", style: {
            width: width ?? CANVAS_WIDTH,
            height: height ?? CANVAS_HEIGHT,
        } }));
}
// ── Click handler ────────────────────────────────────────
function handleClick(state) {
    switch (state.phase) {
        case "IDLE":
            state.phase = "SERVE_SETUP";
            state.score = createInitialScore();
            setupServePosition(state);
            break;
        case "SERVE_SETUP":
            // No click needed — toss starts automatically in update()
            break;
        case "SERVE_AIM":
            if (state.score.servingSide === "player") {
                // Fire at wherever the sweeping cursor currently is
                const aimPos = getServeAimCursor(state);
                fireServe(state, aimPos);
            }
            break;
        case "POINT_SCORED":
            // Let the pause timer handle transition
            break;
        case "GAME_OVER":
            state.phase = "IDLE";
            break;
    }
}
// ── Update ───────────────────────────────────────────────
function update(state) {
    switch (state.phase) {
        case "IDLE":
            break;
        case "SERVE_SETUP":
            if (state.score.servingSide === "bot") {
                state.botServeTimer += 1;
                if (state.botServeTimer >= PHYSICS.BOT_SERVE_DELAY) {
                    state.botServeTimer = 0;
                    startToss(state);
                }
            }
            else {
                // Player: auto-start toss immediately (no click needed)
                startToss(state);
            }
            break;
        case "SERVE_TOSS":
            updateToss(state);
            break;
        case "SERVE_AIM":
            // Sweep the aim cursor
            state.serve.aimTimer += 1;
            break;
        case "SERVE_FIRE":
            updateBall(state.ball);
            // Only the receiver moves during serve
            if (state.score.servingSide === "player") {
                updateBot(state);
            }
            // Check for ball landing (z hit ground)
            if (state.ball.z <= 0 && state.ball.isInPlay) {
                const servingSide = state.score.servingSide;
                const targetSide = servingSide === "player" ? "far" : "near";
                const inBox = isInServiceBox(state.ball.pos, state.court, targetSide, state.score.serviceBox);
                if (inBox) {
                    // Good serve — bounce and start rally
                    state.phase = "RALLY";
                    // Snap mousePos to player so there's no sudden teleport
                    state.mousePos = { ...state.player.pos };
                    state.ball.hasBounced = true;
                    state.ball.z = 0;
                    state.ball.vz = PHYSICS.BOUNCE_VZ;
                    state.ball.vel.x *= PHYSICS.BOUNCE_FRICTION;
                    state.ball.vel.y *= PHYSICS.BOUNCE_FRICTION;
                    // Reset to first serve for next point
                    state.score.serveAttempt = 1;
                }
                else {
                    // Fault!
                    handleFault(state);
                }
            }
            // Ball went way off court
            if (ballOutOfCourt(state.ball, state.court)) {
                const receiver = state.score.servingSide === "player" ? "bot" : "player";
                scorePoint(state, receiver);
            }
            break;
        case "RALLY":
            updateRally(state);
            break;
        case "FAULT":
            state.faultTimer -= 1;
            if (state.faultTimer <= 0) {
                const wasDoubleFault = state.faultMessage === "DOUBLE FAULT";
                state.faultMessage = null;
                if (wasDoubleFault) {
                    // Double fault → point to receiver
                    const receiver = state.score.servingSide === "player" ? "bot" : "player";
                    state.score.serveAttempt = 1;
                    scorePoint(state, receiver);
                }
                else {
                    // First fault → go to second serve
                    state.phase = "SERVE_SETUP";
                    state.botServeTimer = 0;
                    setupServePosition(state);
                }
            }
            break;
        case "POINT_SCORED":
            state.pointPauseTimer -= 1;
            if (state.pointPauseTimer <= 0) {
                if (state.phase === "POINT_SCORED") {
                    state.phase = "SERVE_SETUP";
                    state.botServeTimer = 0;
                    setupServePosition(state);
                }
            }
            break;
        case "GAME_OVER":
            break;
    }
    // Player follows mouse during rally,
    // and during bot's serve flight (so they can position to return)
    const canMove = state.phase === "RALLY" ||
        (state.phase === "SERVE_FIRE" && state.score.servingSide === "bot");
    if (canMove) {
        const p = state.player;
        const court = state.court;
        // Smooth follow
        p.pos.x += (state.mousePos.x - p.pos.x) * PHYSICS.PLAYER_LERP;
        p.pos.y += (state.mousePos.y - p.pos.y) * PHYSICS.PLAYER_LERP;
        // Clamp to player's half (allow going behind baseline)
        p.pos.x = Math.max(court.x, Math.min(court.x + court.width, p.pos.x));
        p.pos.y = Math.max(court.netY + 15, Math.min(court.y + court.height + 30, p.pos.y));
    }
    // Tick down swing animations
    if (state.player.swingTimer > 0)
        state.player.swingTimer--;
    if (state.bot.swingTimer > 0)
        state.bot.swingTimer--;
}
// ── Rally logic ──────────────────────────────────────────
function updateRally(state) {
    updateBall(state.ball);
    updateBot(state);
    const ball = state.ball;
    const court = state.court;
    // Ball hit the ground
    if (ball.z <= 0 && ball.isInPlay) {
        if (!ball.hasBounced) {
            // First bounce — give a small upward bounce
            ball.hasBounced = true;
            ball.z = 0;
            ball.vz = PHYSICS.BOUNCE_VZ;
            ball.vel.x *= PHYSICS.BOUNCE_FRICTION;
            ball.vel.y *= PHYSICS.BOUNCE_FRICTION;
        }
        else {
            // Second bounce — point to the last hitter
            if (ball.lastHitBy) {
                scorePoint(state, ball.lastHitBy);
            }
            return;
        }
    }
    // Ball out of court entirely
    if (ballOutOfCourt(ball, court)) {
        if (ball.lastHitBy) {
            const winner = ball.lastHitBy === "player" ? "bot" : "player";
            scorePoint(state, winner);
        }
        return;
    }
    // Player hit attempt — after bounce (ground stroke) or before bounce (volley/smash)
    if (ball.isInPlay &&
        ball.lastHitBy === "bot" &&
        isOnSide(ball.pos, court, "near")) {
        const dist = distance(state.player.pos, ball.pos);
        if (dist <= PHYSICS.HIT_RADIUS) {
            if (ball.hasBounced && ball.z < 8) {
                // Normal ground stroke after bounce
                playerHit(state, "ground");
            }
            else if (!ball.hasBounced && ball.z <= PHYSICS.VOLLEY_MAX_Z) {
                // Volley — intercept before bounce, ball is low
                playerHit(state, "volley");
            }
            else if (!ball.hasBounced &&
                ball.z > PHYSICS.VOLLEY_MAX_Z &&
                ball.z <= PHYSICS.SMASH_MAX_Z) {
                // Smash — overhead hit, ball is high but reachable
                playerHit(state, "smash");
            }
            // z > SMASH_MAX_Z → ball too high, passes over player
        }
    }
    // Bot hit attempt
    botTryHit(state);
}
// ── Player hits the ball ─────────────────────────────────
function playerHit(state, hitType = "ground") {
    const ball = state.ball;
    const court = state.court;
    // Speed depends on hit type
    let speed = PHYSICS.BALL_SPEED_RALLY;
    if (hitType === "volley")
        speed = PHYSICS.BALL_SPEED_VOLLEY;
    if (hitType === "smash")
        speed = PHYSICS.BALL_SPEED_SMASH;
    // Aim toward the bot's side — bias away from bot position
    const botX = state.bot.pos.x;
    const courtMidX = court.centerServiceX;
    const aimX = botX > courtMidX
        ? court.singlesLeft + 20 + Math.random() * 80
        : court.singlesRight - 20 - Math.random() * 80;
    let aimY;
    if (hitType === "smash") {
        // Smashes aim shorter — closer to net, more aggressive angle
        aimY = court.y + 20 + Math.random() * (court.netY - court.y - 40);
    }
    else {
        // Ground strokes and volleys aim deeper
        aimY = court.y + 30 + Math.random() * (court.netY - court.y - 60);
    }
    const target = { x: aimX, y: aimY };
    ball.vel = calcVelocity(ball.pos, target, speed);
    ball.vz = calcArcVz(ball.z, ball.pos, target, speed);
    ball.lastHitBy = "player";
    ball.hasBounced = false;
    state.player.swingTimer = PHYSICS.SWING_DURATION;
}
// ── Score a point ────────────────────────────────────────
function scorePoint(state, winner) {
    state.lastPointWinner = winner;
    state.ball.isInPlay = false;
    state.ball.vel = { x: 0, y: 0 };
    state.score.serveAttempt = 1; // reset for next point
    const result = awardPoint(state.score, winner);
    if (result.setOver) {
        state.phase = "GAME_OVER";
    }
    else {
        state.phase = "POINT_SCORED";
        state.pointPauseTimer = PHYSICS.POINT_PAUSE_FRAMES;
        toggleServiceBox(state.score);
    }
}
// ── Handle serve fault ──────────────────────────────────
function handleFault(state) {
    state.ball.isInPlay = false;
    state.ball.vel = { x: 0, y: 0 };
    if (state.score.serveAttempt === 1) {
        // First serve fault → show "FAULT", go to second serve
        state.faultMessage = "FAULT";
        state.faultTimer = PHYSICS.FAULT_PAUSE_FRAMES;
        state.phase = "FAULT";
        state.score.serveAttempt = 2;
    }
    else {
        // Double fault → point to receiver
        state.faultMessage = "DOUBLE FAULT";
        state.faultTimer = PHYSICS.FAULT_PAUSE_FRAMES;
        state.phase = "FAULT";
        // Will score the point when fault timer expires
    }
}
// ── Draw ─────────────────────────────────────────────────
function draw(ctx, state) {
    // Court
    drawCourt(ctx, state.court);
    // Service box highlight during aim
    if (state.phase === "SERVE_AIM" && state.score.servingSide === "player") {
        drawServiceBoxHighlight(ctx, state);
    }
    // Sweeping serve aim cursor
    if (state.phase === "SERVE_AIM" && state.score.servingSide === "player") {
        const cursor = getServeAimCursor(state);
        const box = getServiceBox(state);
        const inBox = cursor.x >= box.left &&
            cursor.x <= box.right &&
            cursor.y >= box.top &&
            cursor.y <= box.bottom;
        // Crosshair color: green if in box, red if out
        const color = inBox ? "rgba(100,255,100,0.8)" : "rgba(255,100,100,0.8)";
        const fillColor = inBox ? "rgba(100,255,100,0.3)" : "rgba(255,100,100,0.3)";
        ctx.beginPath();
        ctx.arc(cursor.x, cursor.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = fillColor;
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
        // Crosshair lines
        ctx.beginPath();
        ctx.moveTo(cursor.x - 14, cursor.y);
        ctx.lineTo(cursor.x - 4, cursor.y);
        ctx.moveTo(cursor.x + 4, cursor.y);
        ctx.lineTo(cursor.x + 14, cursor.y);
        ctx.moveTo(cursor.x, cursor.y - 14);
        ctx.lineTo(cursor.x, cursor.y - 4);
        ctx.moveTo(cursor.x, cursor.y + 4);
        ctx.lineTo(cursor.x, cursor.y + 14);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }
    // Ball shadow
    if (state.ball.isInPlay || state.serve.phase === "tossing" || state.serve.phase === "aiming") {
        ctx.beginPath();
        ctx.ellipse(state.ball.shadow.x, state.ball.shadow.y, state.ball.radius + 2, state.ball.radius * 0.5, 0, 0, Math.PI * 2);
        ctx.fillStyle = BALL.SHADOW_COLOR;
        ctx.fill();
    }
    // Ball
    if (state.ball.isInPlay || state.serve.phase === "tossing" || state.serve.phase === "aiming") {
        const visualY = state.ball.pos.y - state.ball.z;
        ctx.beginPath();
        ctx.arc(state.ball.pos.x, visualY, state.ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = BALL.COLOR;
        ctx.fill();
        ctx.strokeStyle = BALL.STROKE_COLOR;
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    // Players
    drawPlayer(ctx, state.player);
    drawPlayer(ctx, state.bot);
    // UI
    drawUI(ctx, state);
}
// ── Draw helpers ─────────────────────────────────────────
function drawPlayer(ctx, player) {
    const x = player.pos.x;
    const y = player.pos.y;
    // near = facing up (toward net), far = facing down (toward net)
    const d = player.side === "near" ? -1 : 1;
    const s = 2; // sprite scale
    ctx.save();
    // Shadow (drawn at world scale, not sprite scale)
    ctx.beginPath();
    ctx.ellipse(x, y + 4, 16, 7, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.fill();
    // Scale up the sprite from player center
    ctx.translate(x, y);
    ctx.scale(s, s);
    // Shoes
    ctx.fillStyle = "#E0E0E0";
    ctx.fillRect(-5, -d * 9, 4, 3);
    ctx.fillRect(1, -d * 9, 4, 3);
    // Shorts
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(-5, -d * 6 - 1, 10, 4);
    // Shirt (main body)
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.roundRect(-6, -3, 12, 7, 2);
    ctx.fill();
    // Arms (skin)
    ctx.fillStyle = "#DEB887";
    ctx.fillRect(-9, -2, 3, 5);
    ctx.fillRect(6, -2, 3, 5);
    // Racket — interpolate between idle and swing pose
    // t = 1 at hit, eases to 0 as swing finishes
    const swingRaw = player.swingTimer / PHYSICS.SWING_DURATION;
    const t = swingRaw * swingRaw; // ease-out (fast start, slow return)
    // Idle pose: handle tip (14, d*4), head (16, d*7), rotation d*0.3
    // Swing pose: handle tip (2, d*12), head (0, d*17), rotation d*1.4 (parallel)
    const handleX = 14 + (2 - 14) * t; // 14 → 2
    const handleY = d * (4 + (12 - 4) * t); // d*4 → d*12
    const headX = 16 + (0 - 16) * t; // 16 → 0
    const headY = d * (7 + (17 - 7) * t); // d*7 → d*17
    const headRot = d * (0.3 + (1.4 - 0.3) * t); // d*0.3 → d*1.4
    // Handle
    ctx.strokeStyle = "#8B7355";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(8, 0);
    ctx.lineTo(handleX, handleY);
    ctx.stroke();
    // Racket head
    const headRx = 3 + 2 * t; // wider when swinging (3 → 5)
    const headRy = 5 - 2 * t; // shorter when swinging (5 → 3)
    ctx.beginPath();
    ctx.ellipse(headX, headY, headRx, headRy, headRot, 0, Math.PI * 2);
    ctx.strokeStyle = "#BBBBBB";
    ctx.lineWidth = 1;
    ctx.stroke();
    // Racket strings
    ctx.strokeStyle = "rgba(200,200,200,0.4)";
    ctx.lineWidth = 0.4;
    ctx.beginPath();
    ctx.moveTo(headX, headY - headRy);
    ctx.lineTo(headX, headY + headRy);
    ctx.moveTo(headX - headRx, headY);
    ctx.lineTo(headX + headRx, headY);
    ctx.stroke();
    // Head
    ctx.beginPath();
    ctx.arc(0, d * 7, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#F0CCA8";
    ctx.fill();
    // Cap (half-circle covering the "front" of head)
    ctx.beginPath();
    if (d === -1) {
        ctx.arc(0, d * 7, 5, Math.PI, 0);
    }
    else {
        ctx.arc(0, d * 7, 5, 0, Math.PI);
    }
    ctx.fillStyle = player.color;
    ctx.fill();
    // Cap visor
    ctx.fillStyle = player.color;
    ctx.fillRect(-5, d * 7 + d * 4, 10, 2);
    ctx.restore();
}
function drawServiceBoxHighlight(ctx, state) {
    const box = getServiceBox(state);
    ctx.fillStyle = "rgba(255,255,100,0.08)";
    ctx.fillRect(box.left, box.top, box.right - box.left, box.bottom - box.top);
    ctx.strokeStyle = "rgba(255,255,100,0.3)";
    ctx.lineWidth = 1;
    ctx.strokeRect(box.left, box.top, box.right - box.left, box.bottom - box.top);
}
function drawUI(ctx, state) {
    ctx.textAlign = "center";
    // Score display at the top
    ctx.font = "bold 16px monospace";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(formatGameScore(state.score), CANVAS_WIDTH / 2, 24);
    ctx.font = "14px monospace";
    ctx.fillText(formatPointScore(state.score), CANVAS_WIDTH / 2, 44);
    // Serving indicator
    const serverLabel = state.score.servingSide === "player" ? "Your" : "Bot's";
    const attemptLabel = state.score.serveAttempt === 2 ? " (2nd)" : "";
    ctx.font = "11px monospace";
    ctx.fillStyle = state.score.serveAttempt === 2 ? "rgba(255,180,80,0.7)" : "rgba(255,255,255,0.5)";
    ctx.fillText(`${serverLabel} serve${attemptLabel}`, CANVAS_WIDTH / 2, 60);
    // Phase-specific messages
    ctx.font = "bold 14px monospace";
    ctx.fillStyle = "#FFFFFF";
    switch (state.phase) {
        case "IDLE":
            ctx.font = "bold 20px monospace";
            ctx.fillText("🎾 TENNIS", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
            ctx.font = "14px monospace";
            ctx.fillStyle = "rgba(255,255,255,0.7)";
            ctx.fillText("Click to start", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10);
            break;
        case "SERVE_SETUP":
        case "SERVE_TOSS":
            if (state.score.servingSide === "bot") {
                ctx.fillStyle = "rgba(255,255,255,0.5)";
                ctx.fillText("Bot serving...", CANVAS_WIDTH / 2, CANVAS_HEIGHT - 30);
            }
            break;
        case "SERVE_AIM":
            ctx.fillText("Click to serve", CANVAS_WIDTH / 2, CANVAS_HEIGHT - 30);
            break;
        case "FAULT":
            ctx.font = "bold 20px monospace";
            ctx.fillStyle = "#FF8844";
            ctx.fillText(state.faultMessage ?? "FAULT", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
            break;
        case "POINT_SCORED":
            ctx.font = "bold 18px monospace";
            ctx.fillStyle = state.lastPointWinner === "player" ? "#4488FF" : "#FF4444";
            ctx.fillText(state.lastPointWinner === "player" ? "Your point!" : "Bot's point!", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
            break;
        case "GAME_OVER": {
            const winner = state.score.playerGames >= 6 ? "You win!" : "Bot wins!";
            ctx.font = "bold 24px monospace";
            ctx.fillStyle = state.score.playerGames >= 6 ? "#4488FF" : "#FF4444";
            ctx.fillText(winner, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 15);
            ctx.font = "14px monospace";
            ctx.fillStyle = "rgba(255,255,255,0.7)";
            ctx.fillText("Click to restart", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 15);
            break;
        }
    }
}
//# sourceMappingURL=TennisGame.js.map