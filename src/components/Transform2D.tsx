import { Component } from "../Component";
import { Entity } from "../Entity";
import { Scene } from "../Scene";
import { Vector2 } from "../utils/vector";
import { Collider2D } from "./Collider2D";
import { RigidBody2D } from "./RigidBody2D";

export class Transform2D extends Component {
  _rigidBody: RigidBody2D | null = null;

  onAttach(): void {
    this._rigidBody = this.entity.getComponent(RigidBody2D);
  }

  private _localPosition: Vector2 = new Vector2(0, 0);

  set localPosition(position: Vector2) {
    this._localPosition = position;
    if (this._attached) {
      this.entity.getComponents(Collider2D).forEach((collider) => {
        collider._updatePosition();
      });
    }
  }
  get localPosition() {
    return this._localPosition;
  }

  _localRotation: number = 0;

  /**
   * The rotation of the entity relative to its parent
   */
  get rotation() {
    if (this._rigidBody) {
      return this._rigidBody.rigidBody.rotation();
    } else {
      return this._localRotation;
    }
  }

  /**
   * The position of the entity relative to its parent
   */
  get position() {
    if (this._rigidBody) {
      return Vector2.fromObject(this._rigidBody.rigidBody.translation());
    } else {
      return this.localPosition.clone();
    }
  }

  /**
   * Get the rotation of the entity relative to the world
   *
   */
  getGlobalRotation(): number {
    if (this._rigidBody) {
      return this._rigidBody.rigidBody.rotation();
    } else {
      if (this.entity.parent instanceof Scene) {
        return this._localRotation;
      } else {
        if ((this.entity.parent as Entity).hasComponent(Transform2D)) {
          return (
            (this.entity.parent as Entity)
              .requireComponent(Transform2D)
              .getGlobalRotation() + this._localRotation
          );
        } else {
          return this._localRotation;
        }
      }
    }
  }

  getGlobalPosition(): Vector2 {
    if (this._rigidBody) {
      return Vector2.fromObject(this._rigidBody.rigidBody.translation());
    } else {
      if (this.entity.parent instanceof Scene) {
        return this.localPosition.clone();
      } else {
        if ((this.entity.parent as Entity).hasComponent(Transform2D)) {
          const parentTransform = (
            this.entity.parent as Entity
          ).requireComponent(Transform2D);

          const parentPosition = parentTransform.getGlobalPosition();
          const parentRotation = parentTransform.getGlobalRotation();

          const rotatedPosition = this.localPosition.rotate(parentRotation);

          return parentPosition.add(rotatedPosition);
        } else {
          return this.localPosition.clone();
        }
      }
    }
  }

  constructor(position?: Vector2, rotation?: number) {
    super();
    if (position) {
      this.localPosition = position;
    }
    if (rotation) {
      this._localRotation = rotation;
    }
  }

  setTranslation(translation: Vector2) {
    if (this._rigidBody) {
      this._rigidBody.rigidBody.setTranslation(translation, true);
    } else {
      this.localPosition = translation;
    }
  }

  translate(translation: Vector2) {
    if (this._rigidBody) {
      this._rigidBody.rigidBody.setTranslation(
        Vector2.fromObject(this._rigidBody.rigidBody.translation()).add(
          translation
        ),
        true
      );
    } else {
      this.localPosition = this.localPosition.add(translation);
    }
  }

  rotate(rotation: number) {
    if (this._rigidBody) {
      this._rigidBody.rigidBody.setRotation(
        this._rigidBody.rigidBody.rotation() + rotation,
        true
      );
    } else {
      this._localRotation += rotation;
    }
  }

  pointTowards(position: Vector2) {
    const globalPosition = this.getGlobalPosition();

    const direction = position.subtract(globalPosition);

    const angle = direction.getAngle();

    this.rotate(angle - this.rotation);
  }

  get forward() {
    return Vector2.fromAngle(this.getGlobalRotation());
  }
}
