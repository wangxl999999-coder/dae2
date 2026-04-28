import Prop from '../models/Prop.js';
import { PROP_TYPES } from '../utils/Constants.js';

class PropManager {
  constructor(config) {
    this.canvas = config.canvas;
    this.ctx = config.ctx;
    this.props = [];
    this.onPropUse = config.onPropUse || (() => {});
    this.x = config.x || 0;
    this.y = config.y || 620;
    this.propWidth = config.propWidth || 60;
    this.propHeight = config.propHeight || 60;
    this.gap = 15;
  }

  init() {
    this.props = [];
    
    const propTypes = [
      PROP_TYPES.REMOVE,
      PROP_TYPES.SHUFFLE,
      PROP_TYPES.COMPLETE
    ];
    
    const totalWidth = propTypes.length * this.propWidth + (propTypes.length - 1) * this.gap;
    const startX = this.x + (this.canvas.width - totalWidth) / 2;
    
    for (let i = 0; i < propTypes.length; i++) {
      const propType = propTypes[i];
      const prop = new Prop({
        id: `prop_${propType.id}`,
        type: propType,
        x: startX + i * (this.propWidth + this.gap),
        y: this.y,
        width: this.propWidth,
        height: this.propHeight,
        count: propType.count
      });
      this.props.push(prop);
    }
  }

  update(deltaTime) {
    for (const prop of this.props) {
      prop.update(deltaTime);
    }
  }

  render() {
    for (const prop of this.props) {
      prop.render(this.ctx);
    }
  }

  onTouchEnd(touches) {
    const touch = touches[0];
    if (!touch) return null;
    
    const x = touch.clientX;
    const y = touch.clientY;
    
    for (const prop of this.props) {
      if (prop.isHit(x, y)) {
        if (prop.count > 0) {
          this.onPropUse(prop.type.id);
          prop.use();
          return prop.type.id;
        }
      }
    }
    
    return null;
  }

  addProp(propId, count = 1) {
    const prop = this.props.find(p => p.type.id === propId);
    if (prop) {
      prop.addCount(count);
    }
  }

  getPropCount(propId) {
    const prop = this.props.find(p => p.type.id === propId);
    return prop ? prop.count : 0;
  }

  reset() {
    this.init();
  }
}

export default PropManager;
