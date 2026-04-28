import Item from '../models/Item.js';
import { ALL_ITEM_TYPES, shuffleArray } from '../utils/Constants.js';

class GameScene {
  constructor(config) {
    this.canvas = config.canvas;
    this.ctx = config.ctx;
    this.items = [];
    this.itemIdCounter = 0;
    this.onItemClick = config.onItemClick || (() => {});
    this.x = config.x || 0;
    this.y = config.y || 150;
    this.width = config.width || this.canvas.width;
    this.height = config.height || 400;
    this.potRadius = Math.min(this.width, this.height) * 0.45;
    this.potX = this.x + this.width / 2;
    this.potY = this.y + this.height / 2;
  }

  init(levelConfig) {
    this.items = [];
    this.itemIdCounter = 0;
    
    const itemTypes = this.getRandomItemTypes(levelConfig.itemTypes);
    const itemPositions = this.generateItemPositions(levelConfig.layers, levelConfig.itemCount);
    
    for (let i = 0; i < levelConfig.itemCount; i += 3) {
      const typeIndex = Math.floor(i / 3) % itemTypes.length;
      const type = itemTypes[typeIndex];
      
      for (let j = 0; j < 3; j++) {
        if (i + j < itemPositions.length && i + j < levelConfig.itemCount) {
          const pos = itemPositions[i + j];
          const item = new Item({
            id: `item_${this.itemIdCounter++}`,
            typeId: type.id,
            x: pos.x,
            y: pos.y,
            width: 50,
            height: 50,
            layer: pos.layer
          });
          this.items.push(item);
        }
      }
    }
    
    this.updateItemVisibility();
  }

  getRandomItemTypes(count) {
    const shuffled = shuffleArray([...ALL_ITEM_TYPES]);
    return shuffled.slice(0, count);
  }

  generateItemPositions(layers, totalItems) {
    const positions = [];
    const itemPerLayer = Math.ceil(totalItems / layers);
    const angleStep = (Math.PI * 2) / itemPerLayer;
    
    for (let layer = 0; layer < layers; layer++) {
      const radius = this.potRadius * (0.3 + layer * 0.15);
      const layerOffset = layer * 20;
      
      for (let i = 0; i < itemPerLayer; i++) {
        if (positions.length >= totalItems) break;
        
        const angle = i * angleStep + (layer % 2 === 0 ? 0 : angleStep / 2);
        const x = this.potX + Math.cos(angle) * radius - 25;
        const y = this.potY + Math.sin(angle) * radius - 25 - layerOffset;
        
        positions.push({
          x: x + (Math.random() - 0.5) * 20,
          y: y + (Math.random() - 0.5) * 20,
          layer: layer
        });
      }
    }
    
    return shuffleArray(positions);
  }

  updateItemVisibility() {
    this.items.sort((a, b) => b.layer - a.layer);
    
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      item.isClickable = true;
      
      for (let j = 0; j < i; j++) {
        const upperItem = this.items[j];
        if (this.isOverlapping(item, upperItem)) {
          item.isClickable = false;
          break;
        }
      }
    }
  }

  isOverlapping(item1, item2) {
    const overlapX = Math.abs((item1.x + item1.width / 2) - (item2.x + item2.width / 2));
    const overlapY = Math.abs((item1.y + item1.height / 2) - (item2.y + item2.height / 2));
    
    return overlapX < item1.width * 0.4 && overlapY < item1.height * 0.4;
  }

  update(deltaTime) {
    for (const item of this.items) {
      item.update(deltaTime);
    }
  }

  render() {
    this.renderPot();
    
    const sortedItems = [...this.items].sort((a, b) => a.layer - b.layer);
    for (const item of sortedItems) {
      item.render(this.ctx);
    }
  }

  renderPot() {
    const ctx = this.ctx;
    
    ctx.save();
    
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.ellipse(this.potX, this.potY + this.potRadius * 0.1, this.potRadius, this.potRadius * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#CD853F';
    ctx.beginPath();
    ctx.moveTo(this.potX - this.potRadius, this.potY - this.potRadius * 0.5);
    ctx.lineTo(this.potX - this.potRadius * 0.7, this.potY + this.potRadius);
    ctx.lineTo(this.potX + this.potRadius * 0.7, this.potY + this.potRadius);
    ctx.lineTo(this.potX + this.potRadius, this.potY - this.potRadius * 0.5);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = '#A0522D';
    ctx.beginPath();
    ctx.ellipse(this.potX, this.potY - this.potRadius * 0.5, this.potRadius, this.potRadius * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#DEB887';
    ctx.beginPath();
    ctx.ellipse(this.potX, this.potY - this.potRadius * 0.5, this.potRadius * 0.9, this.potRadius * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(this.potX, this.potY, this.potRadius * 1.1, Math.PI * 0.7, Math.PI * 0.3);
    ctx.stroke();
    
    ctx.restore();
  }

  onTouchStart(touches) {
    const touch = touches[0];
    const x = touch.clientX;
    const y = touch.clientY;
    
    for (const item of this.items) {
      if (item.isHit(x, y)) {
        item.isSelected = true;
        item.targetScale = 1.2;
        break;
      }
    }
  }

  onTouchEnd(touches) {
    const touch = touches[0];
    if (!touch) return;
    
    const x = touch.clientX;
    const y = touch.clientY;
    
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      if (item.isSelected && item.isClickable) {
        item.isSelected = false;
        item.targetScale = 1;
        
        if (item.isHit(x, y)) {
          this.onItemClick(item);
        }
        break;
      }
    }
    
    for (const item of this.items) {
      item.isSelected = false;
      item.targetScale = 1;
    }
  }

  removeItem(item) {
    const index = this.items.findIndex(i => i.id === item.id);
    if (index !== -1) {
      this.items.splice(index, 1);
      this.updateItemVisibility();
    }
  }

  shakeItems() {
    for (const item of this.items) {
      item.shake(10);
    }
    
    setTimeout(() => {
      const oldItems = [...this.items];
      const positions = oldItems.map(item => ({ x: item.x, y: item.y, layer: item.layer }));
      const shuffledPositions = shuffleArray(positions);
      
      for (let i = 0; i < oldItems.length; i++) {
        oldItems[i].moveTo(shuffledPositions[i].x, shuffledPositions[i].y);
        oldItems[i].layer = shuffledPositions[i].layer;
      }
      
      this.updateItemVisibility();
    }, 500);
  }

  shuffleItems() {
    const positions = this.items.map(item => ({ x: item.x, y: item.y, layer: item.layer }));
    const shuffledPositions = shuffleArray(positions);
    
    for (let i = 0; i < this.items.length; i++) {
      this.items[i].moveTo(shuffledPositions[i].x, shuffledPositions[i].y);
      this.items[i].layer = shuffledPositions[i].layer;
    }
    
    this.updateItemVisibility();
  }

  hasItems() {
    return this.items.length > 0;
  }

  getRandomItemType(excludeTypes = []) {
    const availableTypes = ALL_ITEM_TYPES.filter(t => !excludeTypes.includes(t.id));
    return availableTypes[Math.floor(Math.random() * availableTypes.length)];
  }
}

export default GameScene;
