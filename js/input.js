// input.js
// Key and mouse handlers (moved out of HTML)

function mousePressed() {
  if (gameState === 'GAMEOVER') {
    gameState = 'MENU';
    loop();
  }
}

function keyPressed() {
  // Menu controls
  if (gameState === 'MENU') {
    if (key === '1') startGame('SINGLE');
    if (key === '2') startGame('PVP');
    return;
  }

  if (keyCode === ESCAPE && gameState === 'PLAYING') {
    togglePause();
    return;
  }

  if (isPaused) {
    if (key === '1') setDifficulty('EASY');
    if (key === '2') setDifficulty('HARD');
    return;
  }

  // Player 1 (Green) - WASD + CTRL in PvP, Arrows + Space in Single
  if (gameMode === 'PVP') {
    // Green: WASD movement
    let dir1 = playerSnake.direction;
    if ((key === 'a' || key === 'A') && dir1 !== 'right') {
      playerSnake.nextDirection = 'left';
    } else if ((key === 'd' || key === 'D') && dir1 !== 'left') {
      playerSnake.nextDirection = 'right';
    } else if ((key === 'w' || key === 'W') && dir1 !== 'down') {
      playerSnake.nextDirection = 'up';
    } else if ((key === 's' || key === 'S') && dir1 !== 'up') {
      playerSnake.nextDirection = 'down';
    }

    // Green: CTRL to charge
    if (keyCode === CONTROL) {
      playerSnake.startCharging();
    }

    // Purple: Arrow movement
    let dir2 = enemySnake.direction;
    if (keyCode === LEFT_ARROW && dir2 !== 'right') {
      enemySnake.nextDirection = 'left';
    } else if (keyCode === RIGHT_ARROW && dir2 !== 'left') {
      enemySnake.nextDirection = 'right';
    } else if (keyCode === UP_ARROW && dir2 !== 'down') {
      enemySnake.nextDirection = 'up';
    } else if (keyCode === DOWN_ARROW && dir2 !== 'up') {
      enemySnake.nextDirection = 'down';
    }

    // Purple: Space to charge
    if (key === ' ') {
      enemySnake.startCharging();
    }
  } else {
    // Single player: Arrows + Space for player
    if (key === ' ') {
      playerSnake.startCharging();
    }

    let dir = playerSnake.direction;
    if (keyCode === LEFT_ARROW && dir !== 'right') {
      playerSnake.nextDirection = 'left';
    } else if (keyCode === RIGHT_ARROW && dir !== 'left') {
      playerSnake.nextDirection = 'right';
    } else if (keyCode === UP_ARROW && dir !== 'down') {
      playerSnake.nextDirection = 'up';
    } else if (keyCode === DOWN_ARROW && dir !== 'up') {
      playerSnake.nextDirection = 'down';
    }
  }

  // Prevent scrolling
  if ([LEFT_ARROW, RIGHT_ARROW, UP_ARROW, DOWN_ARROW, 32].includes(keyCode)) {
    return false;
  }
}

function keyReleased() {
  if (gameMode === 'PVP') {
    if (keyCode === CONTROL) {
      playerSnake.releaseCharge();
    }
    if (key === ' ') {
      enemySnake.releaseCharge();
    }
  } else {
    if (key === ' ') {
      playerSnake.releaseCharge();
    }
  }
}