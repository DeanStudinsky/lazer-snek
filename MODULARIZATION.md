Modularization plan for Lazer Snek

Overview
- Split the big inline script into separate files to improve readability and maintenance.
- Keep using p5.js in global mode to avoid changing how setup()/draw() work.

Files added
- `js/assets.js` — preloads PNGs (put your image files in `assets/`) and provides fallbacks if missing.
- `js/laser.js`  — `Laser` class and rendering logic.
- `js/snake.js`  — `Snake` class; `show()` now renders using `assets.snakeHead/body/tail` (rotates as needed).
- `js/game.js`   — main game state functions: `setup()`, `draw()`, menus, HUD, fruit logic, `startGame()` and `gameOver()`.
- `js/input.js`  — keyboard and mouse handlers.

How to add your PNGs
- Create `assets/` at project root.
- Add these files (names are important):
  - `snake_head.png` (a square image where forward is to the right — we'll rotate to match direction)
  - `snake_body.png` (generic filler — can be symmetric horizontally so rotation works)
  - `snake_tail.png`
  - `fruit.png` (we draw this stretched to 3x3 cells)

Notes and tips
- If you prefer oriented head sprites (different graphic per direction), you can add `_up/_down/_left/_right` variants and update `snake.js` to pick the correct one.
- For corner body sprites, create `snake_corner.png` and use it in `snake.js` when the body segment is a corner (there is a clear TODO comment where that would go).
- The code provides simple placeholder graphics so the game still runs if you haven't added PNGs yet.

Next steps (optional)
1. Replace placeholder images with your PNGs.
2. Add corner/head-variants for smoother visuals.
3. Consider moving to ES modules if you want private scopes and imports (requires adapting p5 to instance mode or moving setup/draw to global exports).

