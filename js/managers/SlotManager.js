import Slot from '../models/Slot.js';

class SlotManager {
  constructor(config) {
    this.canvas = config.canvas;
    this.ctx = config.ctx;
    this.slots = [];
    this.maxSlots = 7;
    this.onMatchComplete = config.onMatchComplete || (() => {});
    this.x = config.x || 0;
    this.y = config.y || 550;
    this.slotWidth = config.slotWidth || 45;
    this.slotHeight = config.slotHeight || 45;
    this.gap = 8;
  }

  init() {
    this.slots = [];
    
    const totalWidth = this.maxSlots * this.slotWidth + (this.maxSlots - 1) * this.gap;
    const startX = this.x + (this.canvas.width - totalWidth) / 2;
    
    for (let i = 0; i < this.maxSlots; i++) {
      const slot = new Slot({
        id: `slot_${i}`,
        x: startX + i * (this.slotWidth + this.gap),
        y: this.y,
        width: this.slotWidth,
        height: this.slotHeight
      });
      this.slots.push(slot);
    }
  }

  addItem(item) {
    const emptySlot = this.slots.find(s => s.isEmpty);
    if (!emptySlot) {
      return false;
    }
    
    emptySlot.setItem(item);
    this.checkForMatches();
    
    return true;
  }

  checkForMatches() {
    const filledSlots = this.slots.filter(s => !s.isEmpty);
    if (filledSlots.length < 3) return;
    
    const typeGroups = {};
    
    for (const slot of filledSlots) {
      const typeId = slot.item.typeId;
      if (!typeGroups[typeId]) {
        typeGroups[typeId] = [];
      }
      typeGroups[typeId].push(slot);
    }
    
    for (const typeId in typeGroups) {
      const slots = typeGroups[typeId];
      if (slots.length >= 3) {
        this.removeMatches(slots.slice(0, 3));
        return;
      }
    }
    
    if (this.isFull() && !this.hasPossibleMatch()) {
      this.onMatchComplete('failed');
    }
  }

  removeMatches(matchingSlots) {
    for (const slot of matchingSlots) {
      slot.startMatch();
    }
    
    setTimeout(() => {
      for (const slot of matchingSlots) {
        slot.clearItem();
      }
      this.onMatchComplete('matched');
      this.checkForMatches();
    }, 500);
  }

  hasPossibleMatch() {
    const filledSlots = this.slots.filter(s => !s.isEmpty);
    const typeCount = {};
    
    for (const slot of filledSlots) {
      const typeId = slot.item.typeId;
      typeCount[typeId] = (typeCount[typeId] || 0) + 1;
      if (typeCount[typeId] >= 3) {
        return true;
      }
    }
    
    return false;
  }

  isFull() {
    return this.slots.every(s => !s.isEmpty);
  }

  getLastItem() {
    const filledSlots = this.slots.filter(s => !s.isEmpty);
    if (filledSlots.length === 0) return null;
    return filledSlots[filledSlots.length - 1].item;
  }

  removeLastItem() {
    const filledSlots = this.slots.filter(s => !s.isEmpty);
    if (filledSlots.length === 0) return null;
    
    const lastSlot = filledSlots[filledSlots.length - 1];
    return lastSlot.clearItem();
  }

  getSlotItems() {
    return this.slots.filter(s => !s.isEmpty).map(s => s.item);
  }

  completeTriplet() {
    const filledSlots = this.slots.filter(s => !s.isEmpty);
    if (filledSlots.length === 0) return false;
    
    const typeCount = {};
    for (const slot of filledSlots) {
      const typeId = slot.item.typeId;
      typeCount[typeId] = (typeCount[typeId] || 0) + 1;
    }
    
    let targetType = null;
    let maxCount = 0;
    
    for (const typeId in typeCount) {
      if (typeCount[typeId] > maxCount) {
        maxCount = typeCount[typeId];
        targetType = typeId;
      }
    }
    
    if (!targetType || maxCount >= 3) return false;
    
    const itemsNeeded = 3 - maxCount;
    let added = 0;
    
    for (const slot of this.slots) {
      if (added >= itemsNeeded) break;
      if (slot.isEmpty) {
        const fakeItem = {
          id: `fake_${Date.now()}_${added}`,
          typeId: targetType,
          type: filledSlots[0].item.type
        };
        slot.setItem(fakeItem);
        added++;
      }
    }
    
    this.checkForMatches();
    return true;
  }

  update(deltaTime) {
    for (const slot of this.slots) {
      slot.update(deltaTime);
    }
  }

  render() {
    for (const slot of this.slots) {
      slot.render(this.ctx);
    }
  }

  reset() {
    this.init();
  }
}

export default SlotManager;
