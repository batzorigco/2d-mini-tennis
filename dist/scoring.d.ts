import type { Score } from "./types";
export declare function createInitialScore(): Score;
export declare function awardPoint(score: Score, winner: "player" | "bot"): {
    gameOver: boolean;
    setOver: boolean;
};
export declare function toggleServiceBox(score: Score): void;
export declare function formatPointScore(score: Score): string;
export declare function formatGameScore(score: Score): string;
//# sourceMappingURL=scoring.d.ts.map