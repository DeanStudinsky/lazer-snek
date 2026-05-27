// game.js
let gridWidth = 160;
let gridHeight = 80;

let gameState = 'MENU'; // MENU, PLAYING, GAMEOVER
let gameMode = 'SINGLE'; // SINGLE or PVP
let difficulty = 'HARD';
let isPaused = false;

let frameCounter = 0;
let tickRate = 4; // Move snakes every N frames (lower = faster)

let highScore;
let fruit;
let lasers = [];

let playerSnake;
let enemySnake;

function setup() {
  createCanvas(1000, 500);
  frameRate(60);
  textAlign(CENTER, CENTER);
  textSize(3);

  highScore = getItem('high score') || 0;

  playerSnake = new Snake(true, color(96, 255, 64));
  enemySnake = new Snake(false, color(255, 64, 255));

  updateFruitCoordinates();

  describe('Snake game with combat.');
}

function draw() {
  background(0);

  if (gameState === 'MENU') {
    showMainMenu();
    return;
  }

  scale(width / gridWidth, height / gridHeight);

  if (gameState === 'PLAYING') {
    translate(0.5, 0.5);

    frameCounter++;
    let shouldTick = frameCounter >= tickRate;
    if (shouldTick) frameCounter = 0;

    // Game logic runs on ticks
    if (shouldTick) {
      // AI only in single player
      if (gameMode === 'SINGLE') {
        enemySnake.think(fruit, playerSnake.segments);
      }

      playerSnake.update();
      enemySnake.update();

      if (playerSnake.eat(fruit) || enemySnake.eat(fruit)) {
        updateFruitCoordinates();
      }

      if (playerSnake.checkCollision(enemySnake.segments)) {
        if (gameMode === 'PVP') {
          gameOver("PURPLE WINS!");
        } else {
          gameOver();
        }
      }
      else if (enemySnake.checkCollision(playerSnake.segments)) {
        if (gameMode === 'PVP') {
          gameOver("GREEN WINS!");
        } else {
          enemySnake.reset();
        }
      }
    }

    // Lasers update every frame for smooth movement
    for (let i = lasers.length - 1; i >= 0; i--) {
      lasers[i].update();
      if (lasers[i].active) {
        lasers[i].show();
      } else {
        lasers.splice(i, 1);
      }
    }

    // Rendering every frame
    showFruit();
    playerSnake.show();
    enemySnake.show();
  }

  // HUD
  resetMatrix();
  fill(255);
  noStroke();
  textSize(20);
  textAlign(LEFT, TOP);

  if (gameMode === 'PVP') {
    fill(96, 255, 64);
    text(`GREEN: ${playerSnake.score}`, 20, 20);
    fill(255, 64, 255);
    textAlign(RIGHT, TOP);
    text(`PURPLE: ${enemySnake.score}`, width - 20, 20);
  } else {
    fill(255);
    text(`YOU: ${playerSnake.score}`, 20, 20);
    textAlign(RIGHT, TOP);
    text(`ENEMY: ${enemySnake.score}`, width - 20, 20);
  }
}

function showMainMenu() {
  fill(255);
  textAlign(CENTER, CENTER);

  textSize(48);
  text('SNAKE BATTLE', width / 2, height / 4);

  textSize(28);
  text('1 - Single Player (vs AI)', width / 2, height / 2 - 30);
  text('2 - PvP (Local Multiplayer)', width / 2, height / 2 + 30);

  textSize(18);
  fill(150);
  text('Single Player: Arrows + SPACE', width / 2, height * 0.7);
  text('PvP Green: WASD + CTRL', width / 2, height * 0.7 + 30);
  text('PvP Purple: Arrows + SPACE', width / 2, height * 0.7 + 60);
}

function togglePause() {
  isPaused = !isPaused;
  if (isPaused) {
    showPauseMenu();
    noLoop();
  } else {
    loop();
  }
}

function showPauseMenu() {
  push();
  resetMatrix();
  fill(0, 0, 0, 200);
  rect(0, 0, width, height);

  fill(255);
  textAlign(CENTER, CENTER);
  textSize(40);
  text("PAUSED", width/2, height/2 - 60);

  textSize(24);
  let easyText = difficulty === 'EASY' ? "> 1. Easy (Slower) <" : "1. Easy (Slower)";
  let hardText = difficulty === 'HARD' ? "> 2. Hard (Faster) <" : "2. Hard (Faster)";

  text(easyText, width/2, height/2);
  text(hardText, width/2, height/2 + 40);

  textSize(16);
  fill(200);
  text("Press ESC to Resume", width/2, height/2 + 100);
  pop();
}

function setDifficulty(level) {
  difficulty = level;
  if (difficulty === 'EASY') {
    tickRate = 8; // ~7.5 moves/sec at 60 FPS
  } else {
    tickRate = 4; // 15 moves/sec at 60 FPS
  }
  if (isPaused) {
    showPauseMenu();
  }
}

function startGame(mode) {
  gameMode = mode;
  updateFruitCoordinates();
  playerSnake.reset();
  enemySnake.reset();
  lasers = [];
  frameCounter = 0;
  gameState = 'PLAYING';
  isPaused = false;
  setDifficulty(difficulty);
  loop();
}

function showFruit() {
  // Fruit was 3x3 cells previously
  if (assets && assets.fruitImg) {
    imageMode(CORNER);
    image(assets.fruitImg, fruit.x, fruit.y, 3, 3);
  } else {
    noStroke();
    fill(255, 64, 32);
    rect(fruit.x, fruit.y, 3, 3);
  }
}

function updateFruitCoordinates() {
  let x = floor(random(gridWidth - 2));
  let y = floor(random(gridHeight - 2));
  fruit = createVector(x, y);
}

function gameOver(reason) {
  highScore = max(playerSnake.score, highScore);
  storeItem('high score', highScore);

  push();
  scale(width / gridWidth, height / gridHeight);
  noStroke();
  fill(32);
  rect(2, gridHeight / 2 - 6, gridWidth - 4, 12, 2);
  pop();

  fill(255);
  textAlign(CENTER, CENTER);
  textSize(32);

  let resultMsg = "";
  if (reason) {
    resultMsg = reason;
  } else if (gameMode === 'PVP') {
    resultMsg = playerSnake.score > enemySnake.score ? "GREEN WINS!" : "PURPLE WINS!";
  } else {
    resultMsg = playerSnake.score > enemySnake.score ? "YOU WIN!" : "ENEMY WINS!";
  }

  let p1Label = gameMode === 'PVP' ? 'Green' : 'Your';
  let p2Label = gameMode === 'PVP' ? 'Purple' : 'Enemy';

  text(
    `${resultMsg}
${p1Label} Score: ${playerSnake.score}
${p2Label} Score: ${enemySnake.score}
High Score: ${highScore}
Click to return to menu.`,
    width / 2,
    height / 2
  );

  gameState = 'GAMEOVER';
  noLoop();
}