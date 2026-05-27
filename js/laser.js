// laser.js
class Laser {
  constructor(x, y, dir, color, maxDistance, owner, speed = 2) {
    this.pos = createVector(x, y);
    this.dir = dir;
    this.color = color;
    this.active = true;
    this.speed = speed;
    this.traveled = 0;
    this.maxDistance = maxDistance;
    this.owner = owner;
  }

  update() {
    for (let i = 0; i < this.speed; i++) {
      if (!this.active) return;

      switch (this.dir) {
        case 'right': this.pos.x++; break;
        case 'left': this.pos.x--; break;
        case 'up': this.pos.y--; break;
        case 'down': this.pos.y++; break;
      }

      if (this.pos.x < 0) this.pos.x = gridWidth - 1;
      else if (this.pos.x >= gridWidth) this.pos.x = 0;

      if (this.pos.y < 0) this.pos.y = gridHeight - 1;
      else if (this.pos.y >= gridHeight) this.pos.y = 0;

      this.traveled++;
      if (this.traveled > this.maxDistance) {
        this.active = false;
        return;
      }

      // Check hits based on owner
      if (this.owner === 'player' && this.checkHit(enemySnake)) {
        this.active = false;
        if (gameMode === 'PVP') {
          gameOver("GREEN WINS!");
        } else {
          enemySnake.reset();
        }
        return;
      }

      if (this.owner === 'enemy' && this.checkHit(playerSnake)) {
        this.active = false;
        if (gameMode === 'PVP') {
          gameOver("PURPLE WINS!");
        } else {
          gameOver("YOU WERE SHOT!");
        }
        return;
      }
    }
  }

  checkHit(snake) {
    for (let segment of snake.segments) {
      if (this.pos.equals(segment)) return true;
    }
    return false;
  }

  show() {
    // Keep laser visuals simple (small rect). You could swap this for a sprite if desired.
    noStroke();
    fill(this.color);
    rect(this.pos.x, this.pos.y, 1.2, 1.2);
  }
}