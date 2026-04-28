import { ALL_ITEM_TYPES } from '../utils/Constants.js';

class Item {
  constructor(config) {
    this.id = config.id;
    this.typeId = config.typeId;
    this.type = this.getTypeById(config.typeId);
    this.x = config.x || 0;
    this.y = config.y || 0;
    this.width = config.width || 60;
    this.height = config.height || 60;
    this.layer = config.layer || 0;
    this.isVisible = config.isVisible !== false;
    this.isClickable = config.isClickable !== false;
    this.isSelected = false;
    this.scale = 1;
    this.targetScale = 1;
    this.rotation = 0;
    this.velocityX = 0;
    this.velocityY = 0;
  }

  getTypeById(typeId) {
    return ALL_ITEM_TYPES.find(t => t.id === typeId) || ALL_ITEM_TYPES[0];
  }

  update(deltaTime) {
    this.scale += (this.targetScale - this.scale) * 0.1;
    
    if (this.velocityX !== 0 || this.velocityY !== 0) {
      this.x += this.velocityX;
      this.y += this.velocityY;
      this.velocityX *= 0.95;
      this.velocityY *= 0.95;
      
      if (Math.abs(this.velocityX) < 0.1) this.velocityX = 0;
      if (Math.abs(this.velocityY) < 0.1) this.velocityY = 0;
    }
  }

  render(ctx) {
    if (!this.isVisible) return;
    
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.scale(this.scale, this.scale);
    ctx.rotate(this.rotation);
    
    const radius = Math.min(this.width, this.height) / 2 * 0.8;
    
    if (this.isSelected) {
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = 15;
    }
    
    if (!this.isClickable) {
      ctx.globalAlpha = 0.5;
    }
    
    ctx.font = `${radius * 1.5}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.type.emoji, 0, 0);
    
    ctx.restore();
  }

  isHit(x, y) {
    if (!this.isVisible || !this.isClickable) return false;
    return x >= this.x && x <= this.x + this.width &&
           y >= this.y && y <= this.y + this.height;
  }

  shake(intensity = 5) {
    this.velocityX = (Math.random() - 0.5) * intensity;
    this.velocityY = (Math.random() - 0.5) * intensity;
    this.rotation = (Math.random() - 0.5) * 0.2;
  }

  moveTo(x, y) {
    this.x = x;
    this.y = y;
  }
}

export default Item;
