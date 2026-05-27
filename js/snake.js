// snake.js
// Snake class with image-based rendering for head/body/tail using assets from assets.js

// Sprite faces UP by default
function dirToAngle(dir) {
  switch (dir) {
    case 'up': return 0;
    case 'right': return HALF_PI;
    case 'down': return PI;
    case 'left': return -HALF_PI;
    default: return 0;
  }
}

class Snake {
  constructor(isPlayer, color) {
    this.isPlayer = isPlayer;
    this.color = color;
    this.score = 0;
    this.segments = [];
    this.direction = 'right';
    this.nextDirection = 'right';
    this.cooldown = 0;
    this.isCharging = false;
    this.chargeStartTime = 0;

    this.reset();
  }

  reset() {
    this.score = 0;
    this.segments = [];
    this.direction = this.isPlayer ? 'right' : 'left';
    this.nextDirection = this.direction;
    this.cooldown = 0;
    this.isCharging = false;
    this.chargeStartTime = 0;

    let startX = this.isPlayer ? 10 : gridWidth - 10;
    let startY = this.isPlayer ? 15 : gridHeight - 15;

    for (let i = 0; i < 10; i++) {
      let x = this.isPlayer ? startX - i : startX + i;
      this.segments.push(createVector(x, startY));
    }
  }

  update() {
    if (this.cooldown > 0) this.cooldown--;

    this.direction = this.nextDirection;

    this.segments.pop();

    let head = this.segments[0].copy();
    this.segments.unshift(head);

    switch (this.direction) {
      case 'right': head.x++; break;
      case 'left':  head.x--; break;
      case 'up':    head.y--; break;
      case 'down':  head.y++; break;
    }

    if (head.x < 0) head.x = gridWidth - 1;
    else if (head.x >= gridWidth) head.x = 0;

    if (head.y < 0) head.y = gridHeight - 1;
    else if (head.y >= gridHeight) head.y = 0;
  }

  startCharging() {
    if (this.cooldown > 0 || this.isCharging) return;
    this.isCharging = true;
    this.chargeStartTime = millis();
  }

  releaseCharge() {
    if (!this.isCharging) return;

    this.isCharging = false;
    let chargeDuration = millis() - this.chargeStartTime;

    let charge = constrain(chargeDuration, 0, 4000);
    let distance = map(charge, 0, 4000, 10, 45);

    this.shoot(distance, true);
  }

  shoot(distance, wasCharged = false) {
    let head = this.segments[0];
    let lx = head.x;
    let ly = head.y;

    switch (this.direction) {
      case 'right': lx++; break;
      case 'left': lx--; break;
      case 'up': ly--; break;
      case 'down': ly++; break;
    }

    if (lx < 0) lx = gridWidth - 1;
    else if (lx >= gridWidth) lx = 0;

    if (ly < 0) ly = gridHeight - 1;
    else if (ly >= gridHeight) ly = 0;

    let owner = this.isPlayer ? 'player' : 'enemy';
    let speed = wasCharged ? 1.0 : 0.8; // slower projectiles
    let laser = new Laser(lx, ly, this.direction, this.color, distance, owner, speed);
    laser.traveled = 0;
    lasers.push(laser);

    this.cooldown = 10;
  }

  show() {
    // Charge indicator near head
    if (this.isCharging) {
      let head = this.segments[0];
      let chargeDuration = millis() - this.chargeStartTime;
      let charge = constrain(chargeDuration, 0, 4000);
      let size = map(charge, 0, 4000, 0.5, 3);

      push();
      noStroke();
      fill(255, 255, 255, 120);
      translate(head.x, head.y);
      ellipse(0, 0, size, size);
      pop();
    }

    // Draw segments using images if available
    imageMode(CENTER);
    for (let i = 0; i < this.segments.length; i++) {
      let seg = this.segments[i];
      push();
      translate(seg.x, seg.y);

      if (i === 0) {
        // head - use firing sprite when charging or on cooldown
        let ang = dirToAngle(this.direction);
        rotate(ang);
        let isFiring = this.isCharging || this.cooldown > 0;
        let headImg = isFiring ? assets.snakeHeadFiring : assets.snakeHeadIdle;
        if (assets && headImg) {
          image(headImg, 0, 0, 1.3, 1.3);
        } else {
          noFill(); stroke(this.color); strokeWeight(1); rect(-0.65, -0.65, 1.3, 1.3);
        }
      } else {
        // body and tail segments all use snakeBody
        if (assets && assets.snakeBody) {
          image(assets.snakeBody, 0, 0, 1.3, 1.3);
        } else {
          noFill(); stroke(this.color); strokeWeight(1); rect(-0.65, -0.65, 1.3, 1.3);
        }
      }

      pop();
    }
  }

  checkCollision(otherSnakeSegments) {
    let head = this.segments[0];

    for (let i = 1; i < this.segments.length; i++) {
      if (head.equals(this.segments[i])) return true;
    }

    if (otherSnakeSegments) {
      for (let segment of otherSnakeSegments) {
        if (head.equals(segment)) return true;
      }
    }

    return false;
  }

  eat(pos) {
    let head = this.segments[0];
    if (head.x >= pos.x && head.x <= pos.x + 2 && head.y >= pos.y && head.y <= pos.y + 2) {
      this.score++;
      return true;
    }
    return false;
  }

  think(fruitPos, obstacleSegments) {
    // Keep AI logic same as before
    let head = this.segments[0];
    let playerHead = playerSnake.segments[0];

    let shouldShoot = false;
    if (this.direction === 'right' && playerHead.y === head.y && playerHead.x > head.x) shouldShoot = true;
    if (this.direction === 'left' && playerHead.y === head.y && playerHead.x < head.x) shouldShoot = true;
    if (this.direction === 'down' && playerHead.x === head.x && playerHead.y > head.y) shouldShoot = true;
    if (this.direction === 'up' && playerHead.x === head.x && playerHead.y < head.y) shouldShoot = true;

    if (shouldShoot && this.cooldown === 0) {
      this.shoot(random(10, 45));
    }

    let moves = [
      { dir: 'up',    vec: createVector(0, -1) },
      { dir: 'down',  vec: createVector(0, 1) },
      { dir: 'left',  vec: createVector(-1, 0) },
      { dir: 'right', vec: createVector(1, 0) }
    ];

    let safeMoves = moves.filter(move => {
      if (this.direction === 'right' && move.dir === 'left') return false;
      if (this.direction === 'left' && move.dir === 'right') return false;
      if (this.direction === 'up' && move.dir === 'down') return false;
      if (this.direction === 'down' && move.dir === 'up') return false;

      let nextX = head.x + move.vec.x;
      let nextY = head.y + move.vec.y;

      if (nextX < 0) nextX = gridWidth - 1;
      else if (nextX >= gridWidth) nextX = 0;

      if (nextY < 0) nextY = gridHeight - 1;
      else if (nextY >= gridHeight) nextY = 0;

      for (let s of this.segments) {
        if (nextX === s.x && nextY === s.y) return false;
      }

      for (let s of obstacleSegments) {
        if (nextX === s.x && nextY === s.y) return false;
      }

      return true;
    });

    if (safeMoves.length === 0) return;

    function getWrappedDist(x1, y1, x2, y2) {
      let dx = abs(x1 - x2);
      let dy = abs(y1 - y2);

      if (dx > gridWidth / 2) dx = gridWidth - dx;
      if (dy > gridHeight / 2) dy = gridHeight - dy;

      return sqrt(dx*dx + dy*dy);
    }

    safeMoves.sort((a, b) => {
      let posA = createVector(head.x + a.vec.x, head.y + a.vec.y);
      if (posA.x < 0) posA.x = gridWidth - 1; else if (posA.x >= gridWidth) posA.x = 0;
      if (posA.y < 0) posA.y = gridHeight - 1; else if (posA.y >= gridHeight) posA.y = 0;

      let posB = createVector(head.x + b.vec.x, head.y + b.vec.y);
      if (posB.x < 0) posB.x = gridWidth - 1; else if (posB.x >= gridWidth) posB.x = 0;
      if (posB.y < 0) posB.y = gridHeight - 1; else if (posB.y >= gridHeight) posB.y = 0;

      return getWrappedDist(posA.x, posA.y, fruitPos.x, fruitPos.y) -
             getWrappedDist(posB.x, posB.y, fruitPos.x, fruitPos.y);
    });

    if (difficulty === 'EASY' && safeMoves.length > 1 && random(1) < 0.2) {
       this.nextDirection = random(safeMoves).dir;
    } else {
       this.nextDirection = safeMoves[0].dir;
    }
  }
}