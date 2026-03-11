// ── Create initial score ─────────────────────────────────
export function createInitialScore() {
    return {
        player: 0,
        bot: 0,
        playerGames: 0,
        botGames: 0,
        isDeuce: false,
        advantage: null,
        servingSide: "player",
        serviceBox: "right",
        serveAttempt: 1,
    };
}
// ── Award a point ────────────────────────────────────────
export function awardPoint(score, winner) {
    const loser = winner === "player" ? "bot" : "player";
    // Handle deuce/advantage
    if (score.isDeuce) {
        if (score.advantage === winner) {
            // Advantage + point = game won
            return finishGame(score, winner);
        }
        else if (score.advantage === loser) {
            // Back to deuce
            score.advantage = null;
            return { gameOver: false, setOver: false };
        }
        else {
            // No advantage — give advantage to winner
            score.advantage = winner;
            return { gameOver: false, setOver: false };
        }
    }
    // Normal scoring: 0 → 15 → 30 → 40
    const points = [0, 15, 30, 40];
    const current = score[winner];
    const idx = points.indexOf(current);
    if (current === 40) {
        if (score[loser] === 40) {
            // Enter deuce
            score.isDeuce = true;
            score.advantage = winner;
            return { gameOver: false, setOver: false };
        }
        // Win the game
        return finishGame(score, winner);
    }
    // Advance score
    score[winner] = points[idx + 1];
    return { gameOver: false, setOver: false };
}
// ── Finish a game ────────────────────────────────────────
function finishGame(score, winner) {
    const gamesKey = winner === "player" ? "playerGames" : "botGames";
    score[gamesKey] += 1;
    // Check for set win (first to 6)
    if (score[gamesKey] >= 6) {
        return { gameOver: true, setOver: true };
    }
    // Reset point score
    score.player = 0;
    score.bot = 0;
    score.isDeuce = false;
    score.advantage = null;
    // Switch server
    score.servingSide = score.servingSide === "player" ? "bot" : "player";
    score.serviceBox = "right"; // always start from right
    score.serveAttempt = 1;
    return { gameOver: false, setOver: false };
}
// ── Toggle service box ───────────────────────────────────
export function toggleServiceBox(score) {
    score.serviceBox = score.serviceBox === "right" ? "left" : "right";
}
// ── Format score for display ─────────────────────────────
export function formatPointScore(score) {
    if (score.isDeuce) {
        if (score.advantage === null)
            return "Deuce";
        return `Adv ${score.advantage === "player" ? "You" : "Bot"}`;
    }
    return `${score.player} - ${score.bot}`;
}
export function formatGameScore(score) {
    return `Games: ${score.playerGames} - ${score.botGames}`;
}
//# sourceMappingURL=scoring.js.map