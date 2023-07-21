import { Component } from "../Component";
import RAPIER from "@dimforge/rapier2d";
import { Collider2D } from "./Collider2D";
import { Transform2D } from "./Transform2D";
export class RigidBody2D extends Component {
  rigidBodyDesc: RAPIER.RigidBodyDesc;
  _rigidBody: RAPIER.RigidBody | null = null;

  get rigidBody(): RAPIER.RigidBody {
    if (this._rigidBody === null) {
      throw new Error("RigidBody2D not attached to world");
    }
    return this._rigidBody;
  }

  constructor({ fixed }: { fixed?: boolean }) {
    super();
    this.rigidBodyDesc = fixed
      ? RAPIER.RigidBodyDesc.fixed()
      : RAPIER.RigidBodyDesc.dynamic();
  }

  onDestroy(): void {
    this.scene.worldPhysics.world.removeRigidBody(this.rigidBody);
    for (const collider of this.entity.getComponents(Collider2D)) {
      collider._reAttach();
    }
    const transform = this.entity.getComponent(Transform2D);
    if (transform) {
      transform._rigidBody = null;
    }
  }

  onAttach(): void {
    this._rigidBody = this.scene.worldPhysics.world.createRigidBody(
      this.rigidBodyDesc
    );

    const colliders = this.entity.getComponents(Collider2D);
    for (const collider of colliders) {
      collider._reAttach();
    }

    const transform = this.entity.getComponent(Transform2D);
    if (transform) {
      transform._rigidBody = this;
    }
  }
}
