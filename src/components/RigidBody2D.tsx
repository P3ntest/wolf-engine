import { Component } from "../Component";
import RAPIER from "@dimforge/rapier2d";
import { Collider2D } from "./Collider2D";
import { Transform2D } from "./Transform2D";
import { Vector2 } from "../utils/vector";
export class RigidBody2D extends Component {
  rigidBodyDesc: RAPIER.RigidBodyDesc;
  _rigidBody: RAPIER.RigidBody | null = null;

  get rigidBody(): RAPIER.RigidBody {
    if (this._rigidBody === null) {
      throw new Error("RigidBody2D not attached to world");
    }
    return this._rigidBody;
  }

  constructor(props: { fixed?: boolean; initialPosition?: Vector2 }) {
    super();
    this.rigidBodyDesc =
      props.fixed ?? false
        ? RAPIER.RigidBodyDesc.fixed()
        : RAPIER.RigidBodyDesc.dynamic();

    if (props.initialPosition) {
      this.rigidBodyDesc.setTranslation(
        props.initialPosition.x ?? 0,
        props.initialPosition.y ?? 0
      );
    }
  }

  onDestroy(): void {
    this.scene.worldPhysics._unregisterRigidBody2D(this);
    for (const collider of this.entity.getComponents(Collider2D)) {
      collider._reAttachCollider();
    }
    const transform = this.entity.getComponent(Transform2D);
    if (transform) {
      transform._rigidBody = null;
    }
  }

  onAttach(): void {
    this.scene.worldPhysics._registerRigidBody2D(this);
    const colliders = this.entity.getComponents(Collider2D);
    for (const collider of colliders) {
      collider._reAttachCollider();
    }

    const transform = this.entity.getComponent(Transform2D);
    if (transform) {
      transform._rigidBody = this;
    }
  }
}
