// Клас для фігур, щоб відстежувати їх положення на дошці, а також зберігати колір та форму
class Piece {
  constructor(ctx) {
    this.ctx = ctx;
    this.spawn();
  }
// Спавн випадкової фiгури
  spawn() {
    this.typeId = this.randomizeTetrominoType(COLORS.length - 1);
    this.shape = SHAPES[this.typeId];
    this.color = COLORS[this.typeId];
    this.x = 0;
    this.y = 0;
    this.hardDropped = false;
  }
// Малювання фiгури
  draw() {
    this.ctx.fillStyle = this.color;
    this.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          this.ctx.fillRect(this.x + x, this.y + y, 1, 1)
        }
      });
    });
  }
// Змінювати поточні координати тетраміно на полі
  move(p) {
    if (!this.hardDropped) {
      this.x = p.x;
      this.y = p.y;
    }
    this.shape = p.shape;
  }

  hardDrop() {
    this.hardDropped = true;
  }
// Розташувати фігурку у центрі поля
  setStartingPosition() {
    this.x = this.typeId === 4 ? 4 : 3;
  }
// Випадковим чином вибрати порядковий номер тетраміно
  randomizeTetrominoType(noOfTypes) {
    return Math.floor(Math.random() * noOfTypes + 1);
  }
}
