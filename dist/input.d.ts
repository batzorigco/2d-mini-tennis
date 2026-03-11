import type { Vec2 } from "./types";
export interface InputState {
    mousePos: Vec2;
    mouseClicked: boolean;
    mouseDown: boolean;
}
export declare function createInputHandlers(canvas: HTMLCanvasElement): {
    state: InputState;
    consumeClick(): void;
    cleanup(): void;
};
//# sourceMappingURL=input.d.ts.map