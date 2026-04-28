class CanvasUtils {
  static drawRoundRect(ctx, x, y, width, height, radius) {
    if (radius > width / 2) radius = width / 2;
    if (radius > height / 2) radius = height / 2;
    
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }
  
  static fillRoundRect(ctx, x, y, width, height, radius, fillStyle) {
    if (fillStyle) ctx.fillStyle = fillStyle;
    this.drawRoundRect(ctx, x, y, width, height, radius);
    ctx.fill();
  }
  
  static strokeRoundRect(ctx, x, y, width, height, radius, strokeStyle, lineWidth) {
    if (strokeStyle) ctx.strokeStyle = strokeStyle;
    if (lineWidth) ctx.lineWidth = lineWidth;
    this.drawRoundRect(ctx, x, y, width, height, radius);
    ctx.stroke();
  }
}

export default CanvasUtils;
