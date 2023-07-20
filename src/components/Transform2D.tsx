import { Component } from "../Component";
import { Scene } from "../Scene";
import { Vector2 } from "../utils/vector";
import { RigidBody2D } from "./RigidBody2D";

export class Transform2D extends Component {
  _localPosition: Vector2 = new Vector2();

  localRotation: number = 0;

  get localPosition(): Vector2 {
    return this._localPosition.clone();
  }

  setPosition(vector: Vector2) {
    if (this.entity.hasComponent(RigidBody2D)) {
      this.entity.requireComponent(RigidBody2D).setPosition(vector);
    }
    this._localPosition.x = vector.x;
    this._localPosition.y = vector.y;
  }

  setRotation(rotation: number) {
    if (this.entity.hasComponent(RigidBody2D)) {
      this.entity.requireComponent(RigidBody2D).setRotation(rotation);
    }
    this.localRotation = rotation;
  }

  rotate(rotation: number) {
    if (this.entity.hasComponent(RigidBody2D)) {
      this.entity.requireComponent(RigidBody2D).rotate(rotation);
    }
    this.localRotation += rotation;
  }

  translate(vector: Vector2) {
    if (this.entity.hasComponent(RigidBody2D)) {
      this.entity.requireComponent(RigidBody2D).translate(vector);
    }
    this._localPosition = this._localPosition.add(vector);
  }

  getGlobalRotation(): number {
    if (this.entity.parent instanceof Scene) {
      return this.localRotation;
    }

    const parentTransform = this.entity.parent.requireComponent(Transform2D);

    return parentTransform.getGlobalRotation() + this.localRotation;
  }

  getGlobalPosition(): Vector2 {
    if (this.entity.parent instanceof Scene) {
      return this.localPosition;
    }

    const parentTransform = this.entity.parent.requireComponent(Transform2D);

    const parentGlobalPosition = parentTransform.getGlobalPosition();
    const parentGlobalRotation = parentTransform.getGlobalRotation();

    const rotatedPosition = this.localPosition.rotate(parentGlobalRotation);

    return parentGlobalPosition.add(rotatedPosition);
  }

  setGlobalRotation(rotation: number) {
    if (this.entity.parent instanceof Scene) {
      this.localRotation = rotation;
      return;
    }

    const parentTransform = this.entity.parent.requireComponent(Transform2D);

    const parentGlobalRotation = parentTransform.getGlobalRotation();

    this.localRotation = rotation - parentGlobalRotation;
  }

  setGlobalPosition(x: number, y: number) {
    if (this.entity.parent instanceof Scene) {
      this._localPosition.x = x;
      this._localPosition.y = y;
      return;
    }

    const parentTransform = this.entity.parent.requireComponent(Transform2D);

    const parentGlobalPosition = parentTransform.getGlobalPosition();

    const rotatedPosition = new Vector2(x, y).subtract(parentGlobalPosition);

    const parentGlobalRotation = parentTransform.getGlobalRotation();

    this._localPosition = rotatedPosition.rotate(-parentGlobalRotation);
  }

  renderDebug() {
    return (
      <div>
        Global Position
        <table>
          <tbody>
            <tr>
              <td>X</td>
              <td>Y</td>
            </tr>
            <tr>
              <td style={{ textAlign: "right", minWidth: "100px" }}>
                {this.getGlobalPosition().x.toFixed(3)}
              </td>
              <td style={{ textAlign: "right", minWidth: "100px" }}>
                {this.getGlobalPosition().y.toFixed(3)}
              </td>
            </tr>
          </tbody>
        </table>
        Local Position
        <table>
          <tbody>
            <tr>
              <td>X</td>
              <td>Y</td>
            </tr>
            <tr>
              <td style={{ textAlign: "right", minWidth: "100px" }}>
                {this.localPosition.x.toFixed(3)}
              </td>
              <td style={{ textAlign: "right", minWidth: "100px" }}>
                {this.localPosition.y.toFixed(3)}
              </td>
            </tr>
          </tbody>
        </table>
        Global Rotation
        <span>{this.getGlobalRotation().toFixed(3)} rad</span>
        <br />
        Local Rotation
        <span>{this.localRotation.toFixed(3)} rad</span>
      </div>
    );
  }
}
