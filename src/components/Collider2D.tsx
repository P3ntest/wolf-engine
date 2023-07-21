import { Component } from "../Component";
import RAPIER from "@dimforge/rapier2d";
import { RigidBody2D } from "./RigidBody2D";

export class Collider2D extends Component {
  colliderDesc: RAPIER.ColliderDesc;
  _collider: RAPIER.Collider | null = null;
  get collider(): RAPIER.Collider {
    if (this._collider === null) {
      throw new Error("Collider2D not attached to world");
    }
    return this._collider;
  }

  constructor(collider: RAPIER.ColliderDesc) {
    super();
    this.colliderDesc = collider;
  }

  getComponentDependencies() {
    return [Collider2D];
  }

  onDestroy(): void {
    this._deAttach();
  }

  _deAttach() {
    this.scene.worldPhysics.world.removeCollider(this.collider, true);
  }

  _reAttach(): void {
    this._deAttach();
    this._attach();
  }

  _attach() {
    if (this.entity.requireComponent(RigidBody2D)) {
      const rb = this.entity.requireComponent(RigidBody2D)?.rigidBody;
      this._collider = this.scene.worldPhysics.world.createCollider(
        this.colliderDesc,
        rb
      );
    } else {
      this._collider = this.scene.worldPhysics.world.createCollider(
        this.colliderDesc
      );
    }
  }

  onAttach(): void {
    this._attach;
  }
}
