export declare const CANVAS_WIDTH = 560;
export declare const CANVAS_HEIGHT = 800;
export declare const COURT: {
    MARGIN_X: number;
    MARGIN_TOP: number;
    MARGIN_BOTTOM: number;
    WIDTH: number;
    HEIGHT: number;
    ALLEY_RATIO: number;
    SERVICE_LINE_RATIO: number;
    LINE_WIDTH: number;
    NET_COLOR: string;
    NET_WIDTH: number;
};
export declare const SURFACES: {
    readonly "us-open": {
        readonly court: "#6C935C";
        readonly clearSpace: "#3C638E";
        readonly line: "#FFFFFF";
    };
    readonly "roland-garros": {
        readonly court: "#D1581F";
        readonly clearSpace: "#D1581F";
        readonly line: "#FAEDDD";
    };
    readonly wimbledon: {
        readonly court: "#536D33";
        readonly clearSpace: "#536D33";
        readonly line: "#FFFFFF";
    };
    readonly "aus-open": {
        readonly court: "#377EB8";
        readonly clearSpace: "#1E8FD5";
        readonly line: "#E8F8FF";
    };
};
export declare const BALL: {
    RADIUS: number;
    COLOR: string;
    STROKE_COLOR: string;
    SHADOW_COLOR: string;
};
export declare const PLAYER: {
    RADIUS: number;
    COLOR: string;
    BOT_COLOR: string;
    STROKE_COLOR: string;
};
export declare const PHYSICS: {
    BALL_SPEED_SERVE: number;
    BALL_SPEED_RALLY: number;
    BALL_GRAVITY: number;
    TOSS_GRAVITY: number;
    TOSS_VELOCITY: number;
    TOSS_PEAK_Z: number;
    BOUNCE_VZ: number;
    BOUNCE_FRICTION: number;
    PLAYER_LERP: number;
    BOT_SPEED: number;
    HIT_RADIUS: number;
    POINT_PAUSE_FRAMES: number;
    BOT_SERVE_DELAY: number;
    FAULT_PAUSE_FRAMES: number;
    SERVE_AIM_SPEED_X: number;
    SERVE_AIM_SPEED_Y: number;
    SWING_DURATION: number;
    VOLLEY_MAX_Z: number;
    SMASH_MAX_Z: number;
    BALL_SPEED_VOLLEY: number;
    BALL_SPEED_SMASH: number;
    JOYSTICK_SPEED: number;
};
//# sourceMappingURL=constants.d.ts.map