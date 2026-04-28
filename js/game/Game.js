import GameScene from '../scene/GameScene.js';
import SlotManager from '../managers/SlotManager.js';
import PropManager from '../managers/PropManager.js';
import GuideSystem from '../systems/GuideSystem.js';
import Leaderboard from '../systems/Leaderboard.js';
import CanvasUtils from '../utils/CanvasUtils.js';
import { LEVELS } from '../utils/Constants.js';

const GAME_STATE = {
  MENU: 'menu',
  PLAYING: 'playing',
  GAME_OVER: 'game_over',
  WIN: 'win',
  LEADERBOARD: 'leaderboard'
};

class Game {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.state = GAME_STATE.MENU;
    this.currentLevel = 1;
    this.score = 0;
    this.deltaTime = 0;
    this.lastTime = Date.now();
    
    this.lastShakeTime = 0;
    this.shakeThreshold = 15;
    this.shakeCooldown = 1000;
    
    this.initSystems();
  }

  initSystems() {
    this.gameScene = new GameScene({
      canvas: this.canvas,
      ctx: this.ctx,
      onItemClick: this.onItemClick.bind(this)
    });
    
    this.slotManager = new SlotManager({
      canvas: this.canvas,
      ctx: this.ctx,
      onMatchComplete: this.onMatchComplete.bind(this)
    });
    
    this.propManager = new PropManager({
      canvas: this.canvas,
      ctx: this.ctx,
      onPropUse: this.onPropUse.bind(this)
    });
    
    this.guideSystem = new GuideSystem({
      canvas: this.canvas,
      ctx: this.ctx,
      onGuideComplete: () => {
        console.log('教程完成');
      }
    });
    
    this.leaderboard = new Leaderboard();
  }

  init() {
    this.leaderboard.init();
    this.renderMenu();
  }

  startGame(level) {
    this.currentLevel = level;
    this.score = 0;
    this.state = GAME_STATE.PLAYING;
    
    const levelConfig = LEVELS.find(l => l.id === level) || LEVELS[0];
    
    this.gameScene.init(levelConfig);
    this.slotManager.init();
    this.propManager.init();
    this.guideSystem.init(levelConfig);
  }

  update() {
    const now = Date.now();
    this.deltaTime = now - this.lastTime;
    this.lastTime = now;
    
    if (this.state === GAME_STATE.PLAYING) {
      this.gameScene.update(this.deltaTime);
      this.slotManager.update(this.deltaTime);
      this.propManager.update(this.deltaTime);
      this.guideSystem.update(this.deltaTime);
    }
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.renderBackground();
    
    switch (this.state) {
      case GAME_STATE.MENU:
        this.renderMenu();
        break;
      case GAME_STATE.PLAYING:
        this.renderPlaying();
        break;
      case GAME_STATE.GAME_OVER:
        this.renderGameOver();
        break;
      case GAME_STATE.WIN:
        this.renderWin();
        break;
      case GAME_STATE.LEADERBOARD:
        this.renderLeaderboard();
        break;
    }
  }

  renderBackground() {
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, '#FFE4E1');
    gradient.addColorStop(0.5, '#FFF0F5');
    gradient.addColorStop(1, '#FFE4E1');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  renderMenu() {
    const ctx = this.ctx;
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    
    ctx.fillStyle = '#FF6B6B';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('一起抓大鹅', centerX, centerY - 150);
    
    ctx.font = '60px Arial';
    ctx.fillText('🦢', centerX, centerY - 60);
    
    this.renderButton('开始游戏', centerX, centerY + 50, 200, 50, () => {
      this.startGame(1);
    });
    
    this.renderButton('排行榜', centerX, centerY + 120, 200, 50, () => {
      this.state = GAME_STATE.LEADERBOARD;
    });
    
    if (this.leaderboard.isLoggedIn()) {
      const user = this.leaderboard.getCurrentUser();
      ctx.fillStyle = '#666';
      ctx.font = '14px Arial';
      ctx.fillText(`当前玩家: ${user.nickname}`, centerX, this.canvas.height - 50);
    } else {
      this.renderButton('登录', centerX, this.canvas.height - 80, 100, 35, () => {
        this.leaderboard.login().then(() => {
          console.log('登录成功');
        }).catch(() => {
          console.log('登录失败');
        });
      }, true);
    }
  }

  renderPlaying() {
    const ctx = this.ctx;
    const centerX = this.canvas.width / 2;
    
    ctx.fillStyle = '#FF6B6B';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(`第 ${this.currentLevel} 关`, centerX, 30);
    
    ctx.fillStyle = '#333';
    ctx.font = '16px Arial';
    ctx.fillText(`分数: ${this.score}`, centerX, 60);
    
    this.gameScene.render();
    this.slotManager.render();
    this.propManager.render();
    
    ctx.fillStyle = '#999';
    ctx.font = '12px Arial';
    ctx.fillText('摇晃手机可让物品异位', centerX, this.canvas.height - 30);
    
    this.guideSystem.render();
  }

  renderGameOver() {
    const ctx = this.ctx;
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    const boxWidth = 300;
    const boxHeight = 250;
    const boxX = centerX - boxWidth / 2;
    const boxY = centerY - boxHeight / 2;
    
    CanvasUtils.fillRoundRect(ctx, boxX, boxY, boxWidth, boxHeight, 20, '#FFFFFF');
    
    ctx.fillStyle = '#FF6B6B';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('游戏结束', centerX, boxY + 50);
    
    ctx.fillStyle = '#333';
    ctx.font = '18px Arial';
    ctx.fillText(`本次得分: ${this.score}`, centerX, boxY + 100);
    
    this.renderButton('再试一次', centerX, boxY + 160, 150, 45, () => {
      this.startGame(this.currentLevel);
    });
    
    this.renderButton('返回菜单', centerX, boxY + 220, 150, 45, () => {
      this.state = GAME_STATE.MENU;
    });
  }

  renderWin() {
    const ctx = this.ctx;
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    const boxWidth = 300;
    const boxHeight = 280;
    const boxX = centerX - boxWidth / 2;
    const boxY = centerY - boxHeight / 2;
    
    CanvasUtils.fillRoundRect(ctx, boxX, boxY, boxWidth, boxHeight, 20, '#FFFFFF');
    
    ctx.font = '50px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🎉', centerX, boxY + 40);
    
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 28px Arial';
    ctx.fillText('恭喜通关！', centerX, boxY + 90);
    
    ctx.fillStyle = '#333';
    ctx.font = '18px Arial';
    ctx.fillText(`得分: ${this.score}`, centerX, boxY + 130);
    
    if (this.leaderboard.isLoggedIn()) {
      this.leaderboard.updateScore(this.score, this.currentLevel);
    }
    
    const nextLevel = this.currentLevel + 1;
    if (nextLevel <= LEVELS.length) {
      this.renderButton(`下一关`, centerX, boxY + 180, 150, 45, () => {
        this.startGame(nextLevel);
      });
    } else {
      ctx.fillStyle = '#666';
      ctx.font = '14px Arial';
      ctx.fillText('你已完成所有关卡！', centerX, boxY + 170);
    }
    
    this.renderButton('返回菜单', centerX, boxY + 240, 150, 45, () => {
      this.state = GAME_STATE.MENU;
    });
  }

  renderLeaderboard() {
    const ctx = this.ctx;
    const centerX = this.canvas.width / 2;
    
    ctx.fillStyle = '#FF6B6B';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('排行榜', centerX, 40);
    
    const leaderboard = this.leaderboard.getLeaderboard();
    const startY = 100;
    const itemHeight = 50;
    
    if (leaderboard.length === 0) {
      ctx.fillStyle = '#999';
      ctx.font = '16px Arial';
      ctx.fillText('暂无排行榜数据', centerX, this.canvas.height / 2);
    } else {
      for (let i = 0; i < Math.min(leaderboard.length, 10); i++) {
        const user = leaderboard[i];
        const y = startY + i * itemHeight;
        
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(20, y, this.canvas.width - 40, itemHeight - 5);
        
        ctx.fillStyle = i < 3 ? ['#FFD700', '#C0C0C0', '#CD7F32'][i] : '#333';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`#${i + 1}`, 40, y + itemHeight / 2 - 2);
        
        ctx.fillStyle = '#333';
        ctx.font = '14px Arial';
        ctx.fillText(user.nickname || '玩家', 80, y + itemHeight / 2 - 2);
        
        ctx.textAlign = 'right';
        ctx.fillText(`${user.bestScore}分`, this.canvas.width - 40, y + itemHeight / 2 - 2);
      }
    }
    
    const myRank = this.leaderboard.getMyRank();
    if (myRank) {
      ctx.fillStyle = '#FFE4E1';
      ctx.fillRect(20, this.canvas.height - 120, this.canvas.width - 40, 50);
      
      ctx.fillStyle = '#FF6B6B';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('我的排名', 40, this.canvas.height - 95);
      
      ctx.textAlign = 'center';
      ctx.fillText(`第 ${myRank.rank} 名`, centerX, this.canvas.height - 95);
      
      ctx.textAlign = 'right';
      ctx.fillText(`${myRank.score}分`, this.canvas.width - 40, this.canvas.height - 95);
    }
    
    this.renderButton('返回', centerX, this.canvas.height - 60, 150, 40, () => {
      this.state = GAME_STATE.MENU;
    });
  }

  renderButton(text, x, y, width, height, callback, isSmall = false) {
    const ctx = this.ctx;
    
    CanvasUtils.fillRoundRect(ctx, x - width / 2, y - height / 2, width, height, 10, '#FF6B6B');
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = isSmall ? '14px Arial' : 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
  }

  onItemClick(item) {
    if (this.guideSystem.isGuiding()) {
      this.guideSystem.nextStep();
    }
    
    const added = this.slotManager.addItem(item);
    if (added) {
      this.gameScene.removeItem(item);
      this.score += 10;
      
      if (!this.gameScene.hasItems()) {
        setTimeout(() => {
          this.state = GAME_STATE.WIN;
        }, 500);
      }
    }
  }

  onMatchComplete(result) {
    if (result === 'matched') {
      this.score += 50;
    } else if (result === 'failed') {
      this.state = GAME_STATE.GAME_OVER;
    }
  }

  onPropUse(propId) {
    switch (propId) {
      case 'remove':
        this.slotManager.removeLastItem();
        break;
      case 'shuffle':
        this.gameScene.shuffleItems();
        break;
      case 'complete':
        this.slotManager.completeTriplet();
        break;
    }
  }

  onAccelerometerChange(res) {
    if (this.state !== GAME_STATE.PLAYING) return;
    
    const now = Date.now();
    if (now - this.lastShakeTime < this.shakeCooldown) return;
    
    const acceleration = Math.sqrt(res.x * res.x + res.y * res.y + res.z * res.z);
    
    if (acceleration > this.shakeThreshold) {
      this.lastShakeTime = now;
      this.gameScene.shakeItems();
      
      wx.showToast({
        title: '物品已异位！',
        icon: 'success',
        duration: 1000
      });
    }
  }

  onTouchStart(touches) {
    if (this.state === GAME_STATE.PLAYING) {
      if (this.guideSystem.isGuiding()) {
        return;
      }
      this.gameScene.onTouchStart(touches);
    }
  }

  onTouchMove(touches) {
    // 可以添加滑动逻辑
  }

  onTouchEnd(touches) {
    if (this.state === GAME_STATE.PLAYING) {
      if (this.guideSystem.isGuiding()) {
        this.guideSystem.onTouchEnd();
        return;
      }
      
      const propUsed = this.propManager.onTouchEnd(touches);
      if (propUsed) return;
      
      this.gameScene.onTouchEnd(touches);
    } else if (this.state === GAME_STATE.MENU || 
               this.state === GAME_STATE.GAME_OVER || 
               this.state === GAME_STATE.WIN ||
               this.state === GAME_STATE.LEADERBOARD) {
      this.handleMenuTouch(touches);
    }
  }

  handleMenuTouch(touches) {
    const touch = touches[0];
    if (!touch) return;
    
    const x = touch.clientX;
    const y = touch.clientY;
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    
    if (this.state === GAME_STATE.MENU) {
      if (this.isButtonHit(x, y, centerX, centerY + 50, 200, 50)) {
        this.startGame(1);
        return;
      }
      
      if (this.isButtonHit(x, y, centerX, centerY + 120, 200, 50)) {
        this.state = GAME_STATE.LEADERBOARD;
        return;
      }
      
      if (!this.leaderboard.isLoggedIn()) {
        if (this.isButtonHit(x, y, centerX, this.canvas.height - 80, 100, 35)) {
          this.leaderboard.login().then(() => {
            console.log('登录成功');
          }).catch(() => {
            console.log('登录失败');
          });
        }
      }
    } else if (this.state === GAME_STATE.GAME_OVER) {
      const boxY = centerY - 250 / 2;
      
      if (this.isButtonHit(x, y, centerX, boxY + 160, 150, 45)) {
        this.startGame(this.currentLevel);
        return;
      }
      
      if (this.isButtonHit(x, y, centerX, boxY + 220, 150, 45)) {
        this.state = GAME_STATE.MENU;
        return;
      }
    } else if (this.state === GAME_STATE.WIN) {
      const boxY = centerY - 280 / 2;
      const nextLevel = this.currentLevel + 1;
      
      if (nextLevel <= LEVELS.length) {
        if (this.isButtonHit(x, y, centerX, boxY + 180, 150, 45)) {
          this.startGame(nextLevel);
          return;
        }
      }
      
      if (this.isButtonHit(x, y, centerX, boxY + 240, 150, 45)) {
        this.state = GAME_STATE.MENU;
        return;
      }
    } else if (this.state === GAME_STATE.LEADERBOARD) {
      if (this.isButtonHit(x, y, centerX, this.canvas.height - 60, 150, 40)) {
        this.state = GAME_STATE.MENU;
        return;
      }
    }
  }

  isButtonHit(x, y, centerX, centerY, width, height) {
    return x >= centerX - width / 2 && x <= centerX + width / 2 &&
           y >= centerY - height / 2 && y <= centerY + height / 2;
  }
}

export default Game;
