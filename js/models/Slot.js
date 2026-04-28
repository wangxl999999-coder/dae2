class Slot {
  constructor(config) {
    this.id = config.id;
    this.x = config.x;
    this.y = config.y;
    this.width = config.width || 50;
    this.height = config.height || 50;
    this.item = null;
    this.isEmpty = true;
    this.isMatching = false;
    this.matchProgress = 0;
  }

  setItem(item) {
    this.item = item;
    this.isEmpty = false;
    if (item) {
      item.moveTo(this.x, this.y);
    }
  }

  clearItem() {
    const item = this.item;
    this.item = null;
    this.isEmpty = true;
    return item;
  }

  update(deltaTime) {
    if (this.isMatching) {
      this.matchProgress += 0.05;
      if (this.matchProgress >= 1) {
        this.isMatching = false;
        this.matchProgress = 0;
      }
    }
  }

  render(ctx) {
    ctx.save();
    
    const radius = 8;
    
    ctx.fillStyle = this.isEmpty ? '#F5F5F5' : '#FFFFFF';
    ctx.strokeStyle = this.isMatching ? '#FFD700' : '#E0E0E0';
    ctx.lineWidth = 2;
    
    if (this.isMatching) {
      const scale = 1 + Math.sin(this.matchProgress * Math.PI) * 0.2;
      ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
      ctx.scale(scale, scale);
      ctx.translate(-(this.x + this.width / 2), -(this.y + this.height / 2));
      ctx.globalAlpha = 1 - this.matchProgress;
    }
    
    ctx.beginPath();
    ctx.moveTo(this.x + radius, this.y);
    ctx.lineTo(this.x + this.width - radius, this.y);
    ctx.quadraticCurveTo(this.x + this.width, this.y, this.x + this.width, this.y + radius);
    ctx.lineTo(this.x + this.width, this.y + this.height - radius);
    ctx.quadraticCurveTo(this.x + this.width, this.y + this.height, this.x + this.width - radius, this.y + this.height);
    ctx.lineTo(this.x + radius, this.y + this.height);
    ctx.quadraticCurveTo(this.x, this.y + this.height, this.x, this.y + this.height - radius);
    ctx.lineTo(this.x, this.y + radius);
    ctx.quadraticCurveTo(this.x, this.y, this.x + radius, this.y);
    ctx.closePath();
    
    ctx.fill();
    ctx.stroke();
    
    if (this.item && !this.isMatching) {
      ctx.save();
      ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
      ctx.font = `${this.width * 0.7}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.item.type.emoji, 0, 0);
      ctx.restore();
    }
    
    ctx.restore();
  }

  startMatch() {
    this.isMatching = true;
    this.matchProgress = 0;
  }
}

export default Slot;
