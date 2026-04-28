import Game from './js/game/Game.js';

const canvas = wx.createCanvas();
const ctx = canvas.getContext('2d');

const game = new Game(canvas, ctx);

wx.onTouchStart(function(e) {
  game.onTouchStart(e.touches);
});

wx.onTouchMove(function(e) {
  game.onTouchMove(e.touches);
});

wx.onTouchEnd(function(e) {
  game.onTouchEnd(e.touches);
});

wx.onAccelerometerChange(function(res) {
  game.onAccelerometerChange(res);
});

function gameLoop() {
  game.update();
  game.render();
  requestAnimationFrame(gameLoop);
}

game.init();
gameLoop();
