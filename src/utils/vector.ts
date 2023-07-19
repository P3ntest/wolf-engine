export class Vector2 {
  x = 0;
  y = 0;

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  clone() {
    return new Vector2(this.x, this.y);
  }

  add(vector: Vector2) {
    return new Vector2(this.x + vector.x, this.y + vector.y);
  }

  subtract(vector: Vector2) {
    return new Vector2(this.x - vector.x, this.y - vector.y);
  }

  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  rotate(angle: number) {
    // radians
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    return new Vector2(
      this.x * cos - this.y * sin,
      this.x * sin + this.y * cos
    );
  }

  normalize() {
    const length = this.length();

    if (length === 0) {
      return new Vector2();
    }

    return new Vector2(this.x / length, this.y / length);
  }

  multiplyScalar(scalar: number) {
    return new Vector2(this.x * scalar, this.y * scalar);
  }
}
