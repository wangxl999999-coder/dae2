class GuideSystem {
  constructor(config) {
    this.canvas = config.canvas;
    this.ctx = config.ctx;
    this.isActive = false;
    this.currentStep = 0;
    this.steps = [];
    this.onGuideComplete = config.onGuideComplete || (() => {});
    this.alpha = 0;
    this.targetAlpha = 0;
  }

  init(levelConfig) {
    if (!levelConfig.showGuide) {
      this.isActive = false;
      return;
    }
    
    this.steps = [
      {
        type: 'click_item',
        text: '点击大锅内的物品\n将其放入卡槽中',
        highlightArea: { x: 0, y: 150, width: this.canvas.width, height: 400 }
      },
      {
        type: 'match',
        text: '当卡槽中有3个相同物品时\n会自动消除！',
        highlightArea: { x: 0, y: 550, width: this.canvas.width, height: 50 }
      },
      {
        type: 'complete',
        text: '清空所有物品即可通关！\n加油！',
        highlightArea: null
      }
    ];
    
    this.currentStep = 0;
    this.isActive = true;
    this.targetAlpha = 1;
  }

  nextStep() {
    this.currentStep++;
    if (this.currentStep >= this.steps.length) {
      this.complete();
    }
  }

  complete() {
    this.isActive = false;
    this.targetAlpha = 0;
    this.onGuideComplete();
  }

  update(deltaTime) {
    this.alpha += (this.targetAlpha - this.alpha) * 0.1;
  }

  render() {
    if (!this.isActive && this.alpha < 0.01) return;
    
    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = this.alpha;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    const step = this.steps[this.currentStep];
    if (step && step.highlightArea) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0, 0, 0, 1)';
      const area = step.highlightArea;
      ctx.fillRect(area.x, area.y, area.width, area.height);
      ctx.globalCompositeOperation = 'source-over';
    }
    
    if (step) {
      ctx.globalAlpha = this.alpha;
      this.renderSpeechBubble(step.text);
    }
    
    ctx.restore();
  }

  renderSpeechBubble(text) {
    const ctx = this.ctx;
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const padding = 30;
    const lines = text.split('\n');
    const lineHeight = 30;
    
    ctx.font = 'bold 18px Arial';
    let maxWidth = 0;
    for (const line of lines) {
      const textWidth = ctx.measureText(line).width;
      if (textWidth > maxWidth) maxWidth = textWidth;
    }
    
    const bubbleWidth = maxWidth + padding * 2;
    const bubbleHeight = lines.length * lineHeight + padding * 2;
    const bubbleX = centerX - bubbleWidth / 2;
    const bubbleY = centerY - bubbleHeight / 2 - 50;
    
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#FF6B6B';
    ctx.lineWidth = 3;
    
    const radius = 15;
    ctx.beginPath();
    ctx.moveTo(bubbleX + radius, bubbleY);
    ctx.lineTo(bubbleX + bubbleWidth - radius, bubbleY);
    ctx.quadraticCurveTo(bubbleX + bubbleWidth, bubbleY, bubbleX + bubbleWidth, bubbleY + radius);
    ctx.lineTo(bubbleX + bubbleWidth, bubbleY + bubbleHeight - radius);
    ctx.quadraticCurveTo(bubbleX + bubbleWidth, bubbleY + bubbleHeight, bubbleX + bubbleWidth - radius, bubbleY + bubbleHeight);
    ctx.lineTo(bubbleX + radius, bubbleY + bubbleHeight);
    ctx.quadraticCurveTo(bubbleX, bubbleY + bubbleHeight, bubbleX, bubbleY + bubbleHeight - radius);
    ctx.lineTo(bubbleX, bubbleY + radius);
    ctx.quadraticCurveTo(bubbleX, bubbleY, bubbleX + radius, bubbleY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    ctx.fillStyle = '#333333';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    for (let i = 0; i < lines.length; i++) {
      const lineY = bubbleY + padding + i * lineHeight + lineHeight / 2;
      ctx.fillText(lines[i], centerX, lineY);
    }
    
    ctx.fillStyle = '#FF6B6B';
    ctx.font = '14px Arial';
    const stepText = `点击屏幕继续 (${this.currentStep + 1}/${this.steps.length})`;
    ctx.fillText(stepText, centerX, bubbleY + bubbleHeight + 20);
  }

  onTouchEnd() {
    if (this.isActive) {
      this.nextStep();
      return true;
    }
    return false;
  }

  isGuiding() {
    return this.isActive;
  }
}

export default GuideSystem;
