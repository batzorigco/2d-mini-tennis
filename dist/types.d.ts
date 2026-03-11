export interface Vec2 {
    x: number;
    y: number;
}
export interface SurfaceTheme {
    court: string;
    clearSpace: string;
    line: string;
}
export type SurfaceName = "us-open" | "roland-garros" | "wimbledon" | "aus-open";
export interface Ball {
    pos: Vec2;
    vel: Vec2;
    z: number;
    vz: number;
    radius: number;
    shadow: Vec2;
    isInPlay: boolean;
    lastHitBy: "player" | "bot" | null;
    hasBounced: boolean;
}
export interface Player {
    pos: Vec2;
    radius: number;
    color: string;
    side: "near" | "far";
    swingTimer: number;
}
export interface Score {
    player: number;
    bot: number;
    playerGames: number;
    botGames: number;
    isDeuce: boolean;
    advantage: "player" | "bot" | null;
    servingSide: "player" | "bot";
    serviceBox: "left" | "right";
    serveAttempt: 1 | 2;
}
export type ServePhase = "idle" | "tossing" | "aiming" | "fired";
export interface ServeState {
    phase: ServePhase;
    tossProgress: number;
    aimTarget: Vec2 | null;
    aimTimer: number;
}
export type GamePhase = "IDLE" | "SERVE_SETUP" | "SERVE_TOSS" | "SERVE_AIM" | "SERVE_FIRE" | "FAULT" | "RALLY" | "POINT_SCORED" | "GAME_OVER";
export interface CourtDimensions {
    x: number;
    y: number;
    width: number;
    height: number;
    netY: number;
    serviceLineNear: number;
    serviceLineFar: number;
    centerServiceX: number;
    singlesLeft: number;
    singlesRight: number;
}
export interface GameState {
    phase: GamePhase;
    ball: Ball;
    player: Player;
    bot: Player;
    score: Score;
    serve: ServeState;
    court: CourtDimensions;
    mousePos: Vec2;
    lastPointWinner: "player" | "bot" | null;
    pointPauseTimer: number;
    botServeTimer: number;
    faultMessage: string | null;
    faultTimer: number;
}
//# sourceMappingURL=types.d.ts.map