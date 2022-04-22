// Знайти елемент полотна та отримати контекст 2D для малювання
const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const canvasNext = document.getElementById('next');
const ctxNext = canvasNext.getContext('2d');
// Початковi данi гравця
let accountValues = {
  score: 0,
  level: 0,
  lines: 0
};
// Оновлення даних на екрані
function updateAccount(key, value) {
  let element = document.getElementById(key);
  if (element) {
    element.textContent = value;
  }
}
// Проксіювання доступу до властивостей accountValues
let account = new Proxy(accountValues, {
  set: (target, key, value) => {
    target[key] = value;
    updateAccount(key, value);
    return true;
  }
});

let requestId = null;
let time = null;
// Перемiщення фiгур
const moves = {
  [KEY.LEFT]: (p) => ({ ...p, x: p.x - 1 }),
  [KEY.RIGHT]: (p) => ({ ...p, x: p.x + 1 }),
  [KEY.DOWN]: (p) => ({ ...p, y: p.y + 1 }),
  [KEY.SPACE]: (p) => ({ ...p, y: p.y + 1 }),
  [KEY.UP]: (p) => board.rotate(p, ROTATION.RIGHT),
  [KEY.Q]: (p) => board.rotate(p, ROTATION.LEFT)
};

let board = new Board(ctx, ctxNext);

initNext();

function initNext() {
  // Обчислення розміру полотна з констант.
  ctxNext.canvas.width = 4 * BLOCK_SIZE;
  ctxNext.canvas.height = 4 * BLOCK_SIZE;
  ctxNext.scale(BLOCK_SIZE, BLOCK_SIZE);
}

function addEventListener() {
  document.removeEventListener('keydown', handleKeyPress);
  document.addEventListener('keydown', handleKeyPress);
}

function handleKeyPress(event) {
  if (event.keyCode === KEY.P) {
    pause();
  }
  if (event.keyCode === KEY.ESC) {
    gameOver();
  } else if (moves[event.keyCode]) {
    // Скасування дій за замовчуванням
    event.preventDefault();
    // Отримати новий стан
    let p = moves[event.keyCode](board.piece);
    if (event.keyCode === KEY.SPACE) {
      // Жорстке падіння
      if (document.querySelector('#pause-btn').style.display === 'block') {
      }else{
        return;
      }
      // Перевірка нового положення
      while (board.valid(p)) {
        account.score += POINTS.HARD_DROP;
        // Переміщення фігури, якщо нове становище допустиме
        board.piece.move(p);
        p = moves[KEY.DOWN](board.piece);
      }
      board.piece.hardDrop();
    } else if (board.valid(p)) {
      if (document.querySelector('#pause-btn').style.display === 'block') {
      }
      board.piece.move(p);
      if (event.keyCode === KEY.DOWN && 
          document.querySelector('#pause-btn').style.display === 'block') {
        account.score += POINTS.SOFT_DROP;
      }
    }
  }
}
// Початок нової гри
function resetGame() {
  account.score = 0;
  account.lines = 0;
  account.level = 0;
  board.reset();
  time = { start: performance.now(), elapsed: 0, level: LEVEL[account.level] };
}

function play() {
  addEventListener();
  if (document.querySelector('#play-btn').style.display == '') {
    resetGame();
  }
  // Якщо запущена стара гра, скасування її
  if (requestId) {
    cancelAnimationFrame(requestId);
  }

  animate();
  document.querySelector('#play-btn').style.display = 'none';
  document.querySelector('#pause-btn').style.display = 'block';
}

function animate(now = 0) {
  // оновити минувший час
  time.elapsed = now - time.start;
  // якщо час відображення поточного кадру минув
  if (time.elapsed > time.level) {
    // почати відлік спочатку
    time.start = now;
    if (!board.drop()) {
      gameOver();
      return;
    }
  }

  // Очистити полотно для малювання нового кадру
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
 // малювати ігрове поле
  board.draw();
  requestId = requestAnimationFrame(animate);
}
// Кiнець гри
function gameOver() {
  cancelAnimationFrame(requestId);

  ctx.fillStyle = 'black';
  ctx.fillRect(0, 3, 10, 1.2);
  ctx.font = '1px "Press Start 2P"';
  ctx.fillStyle = 'red';
  ctx.fillText('GAME OVER', 0.5, 4.2);
  document.querySelector('#pause-btn').style.display = 'none';
  document.querySelector('#play-btn').style.display = '';
}
// Призупинення гри
function pause() {
  if (!requestId) {
    document.querySelector('#play-btn').style.display = 'none';
    document.querySelector('#pause-btn').style.display = 'block';
    animate();
    return;
  }

  cancelAnimationFrame(requestId);
  requestId = null;

  ctx.fillStyle = 'black';
  ctx.fillRect(0, 3, 10, 1.2);
  ctx.font = '1px "Press Start 2P"';
  ctx.fillStyle = 'yellow';
  ctx.fillText('PAUSED', 2, 4.2);
  document.querySelector('#play-btn').style.display = 'block';
  document.querySelector('#pause-btn').style.display = 'none';
}