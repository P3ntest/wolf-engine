import { Bodies, Body } from "matter-js";
import { Component } from "../Component";
import { Vector2 } from "../utils/vector";
import { Physics2D } from "../physics/Physics2D";

export class RigidBody2D extends Component {
  body: Matter.Body;

  _collidingWith: Set<RigidBody2D> = new Set();

  constructor(body: Matter.Body) {
    super();

    this.body = body;
  }

  onAttach(): void {
    this.entity.scene.getSystem(Physics2D)?._addBody(this.id, this.body);
  }

  onDestroy(): void {
    this.entity.scene.getSystem(Physics2D)?._removeBody(this.id);
  }

  getCollidingWith(): RigidBody2D[] {
    return Array.from(this._collidingWith);
  }

  applyForce(vector: Vector2, point?: Vector2) {
    Body.applyForce(this.body, point ?? this.body.position, vector);
  }

  translate(vector: Vector2) {
    Body.translate(this.body, vector);
  }

  setVelocity(vector: Vector2) {
    Body.setVelocity(this.body, vector);
  }

  setPosition(vector: Vector2) {
    Body.setPosition(this.body, vector);
  }

  setRotation(rotation: number) {
    Body.setAngle(this.body, rotation);
  }

  rotate(rotation: number) {
    Body.setAngle(this.body, (this.body.angle + rotation) % (Math.PI * 2));
  }

  getVelocity(): Vector2 {
    return new Vector2(this.body.velocity.x, this.body.velocity.y);
  }

  getSpeed(): number {
    return this.body.speed;
  }
}
