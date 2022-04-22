class Board {
  constructor(ctx, ctxNext) {
    this.ctx = ctx;
    this.ctxNext = ctxNext;
    this.init();
  }
  init() {
    // Обчислити розмір полотна з констант.
    this.ctx.canvas.width = COLS * BLOCK_SIZE;
    this.ctx.canvas.height = ROWS * BLOCK_SIZE;
    // Масштабувати, щоб нам не потрібно було вказувати розмір на кожному малюнку.
    this.ctx.scale(BLOCK_SIZE, BLOCK_SIZE);
  }
  // Скидає ігрове поле перед початком нової гри
  reset() {
    this.grid = this.getEmptyGrid();
    this.piece = new Piece(this.ctx);
    this.piece.setStartingPosition();
    this.getNewPiece();
  }
  // Генерує фігуру.
  getNewPiece() {
    const { width, height } = this.ctxNext.canvas;
    this.next = new Piece(this.ctxNext);
    this.ctxNext.clearRect(0, 0, width, height);
    this.next.draw();
  }
  // Малює.
  draw() {
    this.piece.draw();
    this.drawBoard();
  }
  // Скидання фiгури
  drop() {
    let p = moves[KEY.DOWN](this.piece);
    if (this.valid(p)) {
      this.piece.move(p);
    } else {
      this.freeze();
      this.clearLines();

      if (this.piece.y === 0) {
        // Game over
        return false;
      }
      this.piece = this.next;
      this.piece.ctx = this.ctx;
      this.piece.setStartingPosition();
      this.getNewPiece();
    }
    return true;
  }
  // Перевірки, чи не зібрана ціла лінія, яку можна видалити, та видалення всіх таких ліній
  clearLines() {
    let lines = 0;
    this.grid.forEach((row, y) => {
      // Якщо кожне значення більше нуля, ми маємо повний рядок.
      if (row.every((value) => value > 0)) {
        lines++;
        // Видалити рядок.
        this.grid.splice(y, 1);
        // Додати нульовий заповнений рядок у верхній частині.
        this.grid.unshift(Array(COLS).fill(0));
      }
    });

    if (lines > 0) {
      // Додати очки за зібрані лінії.
      account.score += this.getLinesClearedPoints(lines);
      account.lines += lines;
      // Якщо зібрано потрібну кількість ліній, перейти на новий рівень
      if (account.lines >= LINES_PER_LEVEL) {
        // Перейти до наступного рівня
        account.level++;
        // Скинути лічильник ліній
        account.lines -= LINES_PER_LEVEL;
        // Збільшити швидкість гри
        time.level = LEVEL[account.level];
      }
    }
  }
  // Визначити допустимість нових координат на ігровому полі.
  valid(p) {
    return p.shape.every((row, dy) => {
      return row.every((value, dx) => {
        let x = p.x + dx;
        let y = p.y + dy;
        return value === 0 || (this.isInsideWalls(x, y) && this.notOccupied(x, y));
      });
    });
  }
  // Зберігати положення фігурки у матриці ігрового поля
  freeze() {
    this.piece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          this.grid[y + this.piece.y][x + this.piece.x] = value;
        }
      });
    });
  }
  // Малювання цілого поля (з «замороженими» тетраміно)
  drawBoard() {
    this.grid.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          this.ctx.fillStyle = COLORS[value];
          this.ctx.fillRect(x, y, 1, 1);
        }
      });
    });
  }
  getEmptyGrid() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  }
  isInsideWalls(x, y) {
    return x >= 0 && x < COLS && y <= ROWS;
  }
  // чи зайнята клітина поля іншими фігурками
  notOccupied(x, y) {
    return this.grid[y] && this.grid[y][x] === 0;
  }

  rotate(piece, direction) {
    // Клонуйте за допомогою JSON для незмінності.
    let p = JSON.parse(JSON.stringify(piece));
    if (!piece.hardDropped) {
      // Транспонована матриця
      for (let y = 0; y < p.shape.length; ++y) {
        for (let x = 0; x < y; ++x) {
          [p.shape[x][y], p.shape[y][x]] = [p.shape[y][x], p.shape[x][y]];
        }
      }
      // Змінити порядок стовпців.
      if (direction === ROTATION.RIGHT) {
        p.shape.forEach((row) => row.reverse());
      } else if (direction === ROTATION.LEFT) {
        p.shape.reverse();
      }
    }

    return p;
  }
  // Нарахування очок за зібрані лінії. 
  getLinesClearedPoints(lines, level) {
    const lineClearPoints =
      lines === 1
        ? POINTS.SINGLE
        : lines === 2
          ? POINTS.DOUBLE
          : lines === 3
            ? POINTS.TRIPLE
            : lines === 4
              ? POINTS.TETRIS
              : 0;

    return (account.level + 1) * lineClearPoints;
  }
}
