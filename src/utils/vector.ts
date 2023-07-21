import RAPIER from "@dimforge/rapier2d";

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

  _toRapier(): RAPIER.Vector2 {
    return new RAPIER.Vector2(this.x, this.y);
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

  lerp(vector: Vector2, alpha: number) {
    return this.multiplyScalar(1 - alpha).add(vector.multiplyScalar(alpha));
  }

  static UP = new Vector2(0, -1);

  dot(vector: Vector2) {
    return this.x * vector.x + this.y * vector.y;
  }

  cross(vector: Vector2) {
    return this.x * vector.y - this.y * vector.x;
  }

  getAngle() {
    // Angle from the Y axis
    return Math.atan2(this.x, -this.y);
  }

  static fromAngle(angle: number) {
    return new Vector2(Math.sin(angle), -Math.cos(angle));
  }

  getDeltaAngle(other: Vector2 = Vector2.UP) {
    var va = this.normalize();
    var vb = other.normalize();
    var dot = va.dot(vb);
    var cross = vb.cross(va);
    var rad = Math.acos(dot);

    if (cross >= 0) {
      cross = 1;
    }
    if (cross < 0) {
      cross = -1;
    }

    return rad * cross;
  }

  static fromObject(object: { x: number; y: number }) {
    return new Vector2(object.x, object.y);
  }
}
