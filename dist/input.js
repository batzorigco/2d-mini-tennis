export function createInputHandlers(canvas) {
    const state = {
        mousePos: { x: 0, y: 0 },
        mouseClicked: false,
        mouseDown: false,
    };
    function toCanvasMouse(e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY,
        };
    }
    function toCanvasTouch(t) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
            x: (t.clientX - rect.left) * scaleX,
            y: (t.clientY - rect.top) * scaleY,
        };
    }
    // Mouse events
    const onMove = (e) => {
        state.mousePos = toCanvasMouse(e);
    };
    const onDown = (e) => {
        state.mousePos = toCanvasMouse(e);
        state.mouseDown = true;
        state.mouseClicked = true;
    };
    const onUp = () => {
        state.mouseDown = false;
    };
    // Touch events
    const onTouchStart = (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        if (touch) {
            state.mousePos = toCanvasTouch(touch);
            state.mouseDown = true;
            state.mouseClicked = true;
        }
    };
    const onTouchMove = (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        if (touch) {
            state.mousePos = toCanvasTouch(touch);
        }
    };
    const onTouchEnd = (e) => {
        e.preventDefault();
        state.mouseDown = false;
    };
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mousedown", onDown);
    canvas.addEventListener("mouseup", onUp);
    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd, { passive: false });
    return {
        state,
        consumeClick() {
            state.mouseClicked = false;
        },
        cleanup() {
            canvas.removeEventListener("mousemove", onMove);
            canvas.removeEventListener("mousedown", onDown);
            canvas.removeEventListener("mouseup", onUp);
            canvas.removeEventListener("touchstart", onTouchStart);
            canvas.removeEventListener("touchmove", onTouchMove);
            canvas.removeEventListener("touchend", onTouchEnd);
        },
    };
}
//# sourceMappingURL=input.js.map