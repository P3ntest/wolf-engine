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
  }

  onAttach(): void {
    this._attachCollider();
  }
}
