import { RigidBody2D } from "./../components/RigidBody2D";
import { Body, Composite, Engine, Events, Render } from "matter-js";
import { System, SystemUpdateProps } from "../System";
import { ComponentId } from "../Component";
import { Transform2D } from "../components/Transform2D";
import { Scene } from "../Scene";
import { WolfPerformance } from "../Performance";
import RAPIER from "@dimforge/rapier2d";
import { Collider2D } from "../components/Collider2D";

interface PhysicsProps {
  gravity: boolean;
}

export interface PhysicsSystem extends System {
  world: RAPIER.World;
  step: () => void;
  _registerRigidBody2D(rigidBody2D: RigidBody2D): void;
  _unregisterRigidBody2D(rigidBody2D: RigidBody2D): void;
  _registerCollider2D(collider: Collider2D, parent?: RigidBody2D): void;
  _unregisterCollider2D(collider: Collider2D): void;
}

export class Physics2D extends System implements PhysicsSystem {
  world: RAPIER.World;

  constructor(props: PhysicsProps = { gravity: true }) {
    super();

    const worldGravity = {
      x: 0,
      y: props.gravity ? 9.981 : 0,
    };
    this.world = new RAPIER.World(worldGravity);
  }

  eventQueue = new RAPIER.EventQueue(true);

  step() {
    this.world.step(this.eventQueue);

    this.eventQueue.drainCollisionEvents((handle1, handle2, started) => {});
  }

  _registerRigidBody2D(rigidBody2D: RigidBody2D) {
    const rb = this.world.createRigidBody(rigidBody2D.rigidBodyDesc);
    rigidBody2D._rigidBody = rb;
  }

  _unregisterRigidBody2D(rigidBody2D: RigidBody2D): void {
    this.world.removeRigidBody(rigidBody2D.rigidBody);
  }

  _registerCollider2D(collider: Collider2D, parent?: RigidBody2D) {
    const col = this.world.createCollider(
      collider.colliderDesc,
      parent?.rigidBody
    );
    collider._collider = col;
  }

  _unregisterCollider2D(collider: Collider2D): void {
    this.world.removeCollider(collider.collider, true);
  }
}
