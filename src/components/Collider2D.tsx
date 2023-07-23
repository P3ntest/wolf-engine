import { Component } from "../Component";
import RAPIER, { RigidBody } from "@dimforge/rapier2d";
import { RigidBody2D } from "./RigidBody2D";
import { Shape2D } from "../physics/Shape2D";
import { Vector2 } from "../utils/vector";
import { Transform2D } from "./Transform2D";

interface Collider2DProps {
  isSensor?: boolean;
  friction?: number;
  detectCollisions?: boolean;
}
export class Collider2D extends Component {
  colliderDesc: RAPIER.ColliderDesc;
  _collider: RAPIER.Collider | null = null;
  get collider(): RAPIER.Collider {
    if (this._collider === null) {
      throw new Error("Collider2D not attached to world");
    }
    return this._collider;
  }

  _offset: Vector2 = new Vector2(0, 0);
  _rotation: number = 0;

  constructor(shape: Shape2D, public props?: Collider2DProps) {
    super();

    this._offset = shape.offset;
    this._rotation = shape.rotation;

    this.colliderDesc = shape._toColliderDesc();

    this.colliderDesc.setTranslation(this._offset.x, this._offset.y);
    this.colliderDesc.setRotation(this._rotation);

    if (props?.isSensor) {
      this.colliderDesc.setSensor(true);
    }
    if (props?.friction) {
      this.colliderDesc.setFriction(props.friction);
    }
    if (props?.detectCollisions || props?.isSensor) {
      this.colliderDesc.setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS);
    }
  }

  /**
   * Update the position in case the entity has no rigid body its attached to
   */
  _updatePosition() {
    if (!this.entity.getComponent(RigidBody2D)) {
      const transform = this.entity.requireComponent(Transform2D);
      this.collider.setTranslation(
        transform.getGlobalPosition().add(this._offset)._toRapier()
      );

      this.collider.setRotation(transform.getGlobalRotation() + this._rotation);
    }
  }

  onDestroy(): void {
    this._deAttachCollider();
  }

  _deAttachCollider() {
    this.scene.worldPhysics.world.removeCollider(this.collider, true);
  }

  _reAttachCollider(): void {
    this._deAttachCollider();
    this._attachCollider();
  }

  _attachCollider() {
    const rb = this.entity.getComponent(RigidBody2D) ?? undefined;
    this.scene.worldPhysics._registerCollider2D(this, rb);
    this._updatePosition();
  }

  onAttach(): void {
    this._attachCollider();
  }
}
