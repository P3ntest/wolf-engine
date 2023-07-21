import { Body, Composite, Engine, Events, Render } from "matter-js";
import { System, SystemUpdateProps } from "../System";
import { RigidBody2D } from "../components/RigidBody2D";
import { ComponentId } from "../Component";
import { Transform2D } from "../components/Transform2D";
import { Scene } from "../Scene";
import { WolfPerformance } from "../Performance";
import RAPIER from "@dimforge/rapier2d";

interface PhysicsProps {
  gravity: boolean;
}

export interface PhysicsSystem extends System {
  world: RAPIER.World;
}

export class Physics2D extends System implements PhysicsSystem {
  world: RAPIER.World;

  constructor(props: PhysicsProps = { gravity: true }) {
    super();

    const worldGravity = {
      x: 0,
      y: props.gravity ? 0.981 : 0,
    };
    this.world = new RAPIER.World(worldGravity);
  }

  onUpdate({ deltaTime, entities }: SystemUpdateProps) {}
}
