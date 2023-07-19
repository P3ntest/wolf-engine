import { Bodies, Body } from "matter-js";
import { Component } from "../Component";
import { Vector2 } from "../utils/vector";

export class RigidBody2D extends Component {
  body: Matter.Body;

  constructor(body: Matter.Body) {
    super();

    this.body = body;
  }

  applyForce(vector: Vector2) {
    Body.applyForce(this.body, this.body.position, vector);
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
    Body.rotate(this.body, rotation);
  }
}
