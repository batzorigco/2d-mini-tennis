import type { GameState, Vec2 } from "./types";
export declare function startToss(state: GameState): void;
export declare function updateToss(state: GameState): void;
export declare function getServiceBox(state: GameState): {
    left: number;
    right: number;
    top: number;
    bottom: number;
};
export declare function fireServe(state: GameState, target: Vec2): void;
//# sourceMappingURL=serve.d.ts.map