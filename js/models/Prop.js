class Prop {
  constructor(config) {
    this.id = config.id;
    this.type = config.type;
    this.x = config.x;
    this.y = config.y;
    this.width = config.width || 60;
    this.height = config.height || 60;
    this.count = config.count || 0;
    this.isCooldown = false;
    this.cooldownTime = 0;
  }

  update(deltaTime) {
    if (this.isCooldown) {
      this.cooldownTime -= deltaTime;
      if (this.cooldownTime <= 0) {
        this.isCooldown = false;
      }
    }
  }

  render(ctx) {
    ctx.save();
    
    const radius = 10;
    const isAvailable = this.count > 0 && !this.isCooldown;
    
    ctx.fillStyle = isAvailable ? '#FFFFFF' : '#CCCCCC';
    ctx.strokeStyle = isAvailable ? '#FF6B6B' : '#999999';
    ctx.lineWidth = 2;
    
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
    
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.font = `${this.width * 0.5}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.type.icon, 0, -5);
    ctx.restore();
    
    ctx.fillStyle = isAvailable ? '#FF6B6B' : '#999999';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`x${this.count}`, this.x + this.width / 2, this.y + this.height - 5);
    
    if (this.isCooldown) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.beginPath();
      ctx.moveTo(this.x + this.width / 2, this.y + this.height / 2);
      ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, -Math.PI / 2, 
              -Math.PI / 2 + (1 - this.cooldownTime / 1000) * Math.PI * 2);
      ctx.lineTo(this.x + this.width / 2, this.y + this.height / 2);
      ctx.fill();
    }
    
    ctx.restore();
  }

  isHit(x, y) {
    return x >= this.x && x <= this.x + this.width &&
           y >= this.y && y <= this.y + this.height;
  }

  use() {
    if (this.count > 0 && !this.isCooldown) {
      this.count--;
      this.isCooldown = true;
      this.cooldownTime = 500;
      return true;
    }
    return false;
  }

  addCount(amount = 1) {
    this.count += amount;
  }
}

export default Prop;
