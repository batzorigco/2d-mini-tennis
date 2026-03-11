import type { Vec2 } from "./types";
export interface InputState {
    mousePos: Vec2;
    mouseClicked: boolean;
    mouseDown: boolean;
    joystickActive: boolean;
    joystickDir: Vec2;
    joystickForce: number;
}
export declare function createInputHandlers(canvas: HTMLCanvasElement): {
    state: InputState;
    consumeClick(): void;
    cleanup(): void;
};
export declare function setupJoystick(container: HTMLElement, state: InputState): () => void;
//# sourceMappingURL=input.d.ts.map