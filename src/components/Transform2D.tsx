import { Component } from "../Component";
import { Vector2 } from "../utils/vector";
import { RigidBody2D } from "./RigidBody2D";

export class Transform2D extends Component {
  _rigidBody: RigidBody2D | null = null;

  onAttach(): void {
    this._rigidBody = this.entity.getComponent(RigidBody2D);
  }

  _localPosition: Vector2 = new Vector2(0, 0);
  _localRotation: number = 0;

  getRotation() {
    if (this._rigidBody) {
      return this._rigidBody.rigidBody.rotation();
    } else {
      return this._localRotation;
    }
  }

  getGlobalRotation() {
    if (this._rigidBody) {
      return this._rigidBody.rigidBody.rotation();
    } else {
      // TODO:
      return this.getRotation();
    }
  }

  getPosition(): Vector2 {
    if (this._rigidBody) {
      return Vector2.fromObject(this._rigidBody.rigidBody.translation());
    } else {
      return this._localPosition.clone();
    }
  }

  getGlobalPosition(): Vector2 {
    if (this._rigidBody) {
      return Vector2.fromObject(this._rigidBody.rigidBody.translation());
    } else {
      // TODO:
      return this.getPosition();
    }
  }
}
