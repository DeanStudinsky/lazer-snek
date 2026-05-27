// assets.js
// Loads PNG assets (put your PNGs under /assets)
let assets = {};

function preload() {
  // Try to load images; if any fail, we create a simple placeholder graphic
  assets.snakeHeadFiring = loadImage('snek-head.png', () => {}, () => { assets.snakeHeadFiring = createPlaceholder('#60ff40'); });
  assets.snakeHeadIdle = loadImage('snek-head-idle.png', () => {}, () => { assets.snakeHeadIdle = createPlaceholder('#60ff40'); });
  assets.snakeBody = loadImage('snek-body-alt.png', () => {}, () => { assets.snakeBody = createPlaceholder('#b0b0b0'); });
}

function createPlaceholder(col) {
  // Create a small square placeholder graphic (32x32)
  let g = createGraphics(32, 32);
  g.noStroke();
  g.fill(col);
  g.rect(0, 0, 32, 32);
  return g;
}