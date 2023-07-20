import { Body, Composite, Engine, Events, Render } from "matter-js";
import { System, SystemUpdateProps } from "../System";
import { RigidBody2D } from "../components/RigidBody2D";
import { ComponentId } from "../Component";
import { Transform2D } from "../components/Transform2D";
import { Scene } from "../Scene";

export class Physics2D extends System {
  engine: Engine;

  getComponentFromBody(body: Matter.Body): RigidBody2D | null {
    for (const [id, b] of this.bodies) {
      if (b === body) {
        return this.scene.getComponentById(id) as RigidBody2D;
      }
    }

    return null;
  }

  constructor() {
    super();
    this.engine = Engine.create();

    registerEngineEvents(this.engine, this);

    const renderer = Render.create({
      element: document.body,
      engine: this.engine,
    });

    Render.run(renderer);
  }

  bodies: Map<ComponentId, Matter.Body> = new Map();

  onUpdate({ deltaTime, entities }: SystemUpdateProps) {
    const rigidBodies = entities.filter((entity) =>
      entity.hasComponent(RigidBody2D)
    );

    // Make sure all rigid bodies have a body
    rigidBodies.forEach((entity) => {
      const rigidBody = entity.requireComponent(RigidBody2D);
      if (!this.bodies.has(rigidBody.id)) {
        this.bodies.set(rigidBody.id, rigidBody.body);
        Composite.add(this.engine.world, rigidBody.body);
      }
    });

    // Remove bodies that no longer have a rigid body
    this.bodies.forEach((body, id) => {
      if (
        !rigidBodies.some(
          (entity) => entity.requireComponent(RigidBody2D).id === id
        )
      ) {
        Composite.remove(this.engine.world, body);
        this.bodies.delete(id);
      }
    });

    // Patch position of rigid bodies to match Transform
    // rigidBodies.forEach((entity) => {
    //   const rigidBody = entity.requireComponent(RigidBody2D);
    //   const transform = entity.requireComponent(Transform2D);
    //   const { x, y } = transform.getGlobalPosition();
    //   const angle = transform.getGlobalRotation();
    //   const body = this.bodies.get(rigidBody.id)!;

    //   Body.setAngle(body, angle);
    //   Body.setPosition(body, { x, y });
    // });

    Engine.update(this.engine, deltaTime);

    // Patch position of Transform to match rigid bodies
    rigidBodies.forEach((entity) => {
      const rigidBody = entity.requireComponent(RigidBody2D);
      const transform = entity.requireComponent(Transform2D);
      const body = this.bodies.get(rigidBody.id)!;
      const { x, y } = body.position;
      const angle = body.angle;
      transform.setGlobalPosition(x, y);
      transform.setGlobalRotation(angle);
    });
  }
}

function registerEngineEvents(engine: Engine, physics: Physics2D) {
  Events.on(engine, "collisionStart", (event) => {
    const pairs = event.pairs;

    for (const pair of pairs) {
      const { bodyA, bodyB } = pair;

      const componentA = physics.getComponentFromBody(bodyA);
      const componentB = physics.getComponentFromBody(bodyB);

      if (componentA && componentB) {
        componentA._collidingWith.add(componentB);
        componentB._collidingWith.add(componentA);

        componentA.entity.components.forEach((component) => {
          if (component.onCollisionStart2D) {
            component.onCollisionStart2D(componentB);
          }
        });
        componentB.entity.components.forEach((component) => {
          if (component.onCollisionStart2D) {
            component.onCollisionStart2D(componentA);
          }
        });
      } else {
        console.warn("Collision between unknown bodies");
      }
    }
  });

  Events.on(engine, "collisionEnd", (event) => {
    const pairs = event.pairs;

    for (const pair of pairs) {
      const { bodyA, bodyB } = pair;

      const componentA = physics.getComponentFromBody(bodyA);
      const componentB = physics.getComponentFromBody(bodyB);

      if (componentA && componentB) {
        componentA._collidingWith.delete(componentB);
        componentB._collidingWith.delete(componentA);

        componentA.entity.components.forEach((component) => {
          if (component.onCollisionEnd2D) {
            component.onCollisionEnd2D(componentB);
          }
        });

        componentB.entity.components.forEach((component) => {
          if (component.onCollisionEnd2D) {
            component.onCollisionEnd2D(componentA);
          }
        });
      } else {
        console.warn("Collision between unknown bodies");
      }
    }
  });
}
