const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const bestScoreEl = document.getElementById("best-score");
const statusEl = document.getElementById("status");
const restartBtn = document.getElementById("restart");

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake;
let direction;
let pendingDirection;
let food;
let score;
let bestScore = Number(localStorage.getItem("snake-best-score") || 0);
let gameLoop;
let gameStarted;

bestScoreEl.textContent = bestScore;

function resetGame() {
  snake = [{ x: 10, y: 10 }];
  direction = { x: 0, y: 0 };
  pendingDirection = { x: 0, y: 0 };
  score = 0;
  gameStarted = false;
  scoreEl.textContent = score;
  statusEl.textContent = "Pulsa una tecla para comenzar.";
  placeFood();
  draw();
}

function placeFood() {
  do {
    food = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount),
    };
  } while (snake.some((part) => part.x === food.x && part.y === food.y));
}

function drawCell(x, y, color, radius = 4) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x * gridSize + 1, y * gridSize + 1, gridSize - 2, gridSize - 2, radius);
  ctx.fill();
}

function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "rgba(255,255,255,0.07)";
  ctx.lineWidth = 1;

  for (let i = 1; i < tileCount; i += 1) {
    const pos = i * gridSize;
    ctx.beginPath();
    ctx.moveTo(pos, 0);
    ctx.lineTo(pos, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, pos);
    ctx.lineTo(canvas.width, pos);
    ctx.stroke();
  }
}

function draw() {
  drawGrid();
  drawCell(food.x, food.y, "#ff6b6b", 10);

  snake.forEach((part, idx) => {
    const isHead = idx === 0;
    drawCell(part.x, part.y, isHead ? "#5cf0c7" : "#20c997", isHead ? 7 : 4);
  });
}

function update() {
  if (!gameStarted) return;

  direction = pendingDirection;
  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y,
  };

  const hitWall = head.x < 0 || head.y < 0 || head.x >= tileCount || head.y >= tileCount;
  const hitSelf = snake.some((part) => part.x === head.x && part.y === head.y);

  if (hitWall || hitSelf) {
    clearInterval(gameLoop);
    statusEl.textContent = `¡Perdiste! Puntuación final: ${score}`;
    gameStarted = false;
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 1;
    scoreEl.textContent = score;

    if (score > bestScore) {
      bestScore = score;
      bestScoreEl.textContent = bestScore;
      localStorage.setItem("snake-best-score", String(bestScore));
    }

    placeFood();
  } else {
    snake.pop();
  }

  draw();
}

function setDirection(nextX, nextY) {
  if (direction.x === -nextX && direction.y === -nextY) return;

  if (!gameStarted) {
    gameStarted = true;
    statusEl.textContent = "¡Sigue así!";
  }

  pendingDirection = { x: nextX, y: nextY };
}

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();

  if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"].includes(key)) {
    event.preventDefault();
  }

  if (key === "arrowup" || key === "w") setDirection(0, -1);
  if (key === "arrowdown" || key === "s") setDirection(0, 1);
  if (key === "arrowleft" || key === "a") setDirection(-1, 0);
  if (key === "arrowright" || key === "d") setDirection(1, 0);
});

restartBtn.addEventListener("click", resetGame);

resetGame();
gameLoop = setInterval(update, 120);
