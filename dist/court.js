import { CANVAS_WIDTH, CANVAS_HEIGHT, COURT } from "./constants";
export function createCourtDimensions() {
    const x = COURT.MARGIN_X;
    const y = COURT.MARGIN_TOP;
    const width = COURT.WIDTH;
    const height = COURT.HEIGHT;
    const netY = y + height / 2;
    const halfH = height / 2;
    const serviceOffset = halfH * COURT.SERVICE_LINE_RATIO;
    const alleyW = width * COURT.ALLEY_RATIO;
    return {
        x,
        y,
        width,
        height,
        netY,
        serviceLineNear: netY + serviceOffset,
        serviceLineFar: netY - serviceOffset,
        centerServiceX: x + width / 2,
        singlesLeft: x + alleyW,
        singlesRight: x + width - alleyW,
    };
}
function line(ctx, x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}
export function drawCourt(ctx, court, theme) {
    // Clear space background
    ctx.fillStyle = theme.clearSpace;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    // Court surface
    ctx.fillStyle = theme.court;
    ctx.fillRect(court.x, court.y, court.width, court.height);
    // Lines
    ctx.strokeStyle = theme.line;
    ctx.lineWidth = COURT.LINE_WIDTH;
    // Outer boundary
    ctx.strokeRect(court.x, court.y, court.width, court.height);
    // Singles sidelines
    line(ctx, court.singlesLeft, court.y, court.singlesLeft, court.y + court.height);
    line(ctx, court.singlesRight, court.y, court.singlesRight, court.y + court.height);
    // Service lines
    line(ctx, court.singlesLeft, court.serviceLineFar, court.singlesRight, court.serviceLineFar);
    line(ctx, court.singlesLeft, court.serviceLineNear, court.singlesRight, court.serviceLineNear);
    // Center service line
    line(ctx, court.centerServiceX, court.serviceLineFar, court.centerServiceX, court.serviceLineNear);
    // Center ticks on baselines
    const tick = 8;
    line(ctx, court.centerServiceX, court.y, court.centerServiceX, court.y + tick);
    line(ctx, court.centerServiceX, court.y + court.height, court.centerServiceX, court.y + court.height - tick);
    // Net
    ctx.strokeStyle = COURT.NET_COLOR;
    ctx.lineWidth = COURT.NET_WIDTH;
    line(ctx, court.x - 10, court.netY, court.x + court.width + 10, court.netY);
    // Net posts
    ctx.fillStyle = COURT.NET_COLOR;
    ctx.fillRect(court.x - 14, court.netY - 3, 6, 6);
    ctx.fillRect(court.x + court.width + 8, court.netY - 3, 6, 6);
}
//# sourceMappingURL=court.js.map