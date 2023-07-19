import { Component } from "../Component";
import { Scene } from "../Scene";
import { Vector2 } from "../utils/vector";

export class Transform2D extends Component {
  _localPosition: Vector2 = new Vector2();

  localRotation: number = 0;

  get localPosition(): Vector2 {
    return this._localPosition.clone();
  }

  setPosition(x: number, y: number) {
    this._localPosition.x = x;
    this._localPosition.y = y;
  }

  setRotation(rotation: number) {
    this.localRotation = rotation;
  }

  rotate(rotation: number) {
    this.localRotation += rotation;
  }

  move(vector: Vector2) {
    this._localPosition = this._localPosition.add(vector);
  }

  constructor() {
    super();
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
      </div>
    );
  }
}
