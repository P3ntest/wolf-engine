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

  _initialPosition: Vector2 = new Vector2(0, 0);
  _initialRotation: number = 0;
  constructor(
    public props: {
      fixed?: boolean;
      initialPosition?: Vector2;
      initialRotation?: number;
      lockRotation?: boolean;
    }
  ) {
    super();
    this.rigidBodyDesc =
      props.fixed ?? false
        ? RAPIER.RigidBodyDesc.fixed()
        : RAPIER.RigidBodyDesc.dynamic();

    this._initialPosition = props.initialPosition ?? this._initialPosition;
    this._initialRotation = props.initialRotation ?? this._initialRotation;
  }

  onDestroy(): void {
    this.scene.worldPhysics._unregisterRigidBody2D(this);
    const transform = this.entity.getComponent(Transform2D);
    if (transform) {
      transform._rigidBody = null;
    }
    for (const collider of this.entity.getComponents(Collider2D)) {
      collider._reAttachCollider();
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

    this.rigidBody.setRotation(this._initialRotation, true);
    this.rigidBody.setTranslation(this._initialPosition._toRapier(), true);

    if (this.props.lockRotation) this.rigidBody.lockRotations(true, false);
  }

  lerpForce(targetForce: Vector2, thrust: number) {
    const currentVelocity = Vector2.fromObject(this.rigidBody.linvel());

    const force = targetForce.subtract(currentVelocity).multiplyScalar(thrust);

    this.rigidBody.applyImpulse(force._toRapier(), true);
  }

  applyImpulse(impulse: Vector2) {
    this.rigidBody.applyImpulse(impulse._toRapier(), true);
  }
}
