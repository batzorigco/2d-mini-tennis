import type { Ball, Vec2, CourtDimensions } from "./types";
export declare function updateBall(ball: Ball): void;
export declare function calcArcVz(startZ: number, from: Vec2, to: Vec2, speed: number): number;
export declare function calcVelocity(from: Vec2, to: Vec2, speed: number): Vec2;
export declare function distance(a: Vec2, b: Vec2): number;
export declare function magnitude(v: Vec2): number;
export declare function isInServiceBox(pos: Vec2, court: CourtDimensions, targetSide: "near" | "far", targetBox: "left" | "right"): boolean;
export declare function isOnSide(pos: Vec2, court: CourtDimensions, side: "near" | "far"): boolean;
export declare function ballOutOfCourt(ball: Ball, _court: CourtDimensions): boolean;
export declare function isInSingles(pos: Vec2, court: CourtDimensions): boolean;
//# sourceMappingURL=physics.d.ts.map