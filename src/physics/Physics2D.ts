import { Body, Composite, Engine, Events, Render } from "matter-js";
import { System, SystemUpdateProps } from "../System";
import { RigidBody2D } from "../components/RigidBody2D";
import { ComponentId } from "../Component";
import { Transform2D } from "../components/Transform2D";
import { Scene } from "../Scene";
import { WolfPerformance } from "../Performance";

interface PhysicsProps {
  gravity: boolean;
}

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

  constructor(props: PhysicsProps = { gravity: true }) {
    super();
    this.engine = Engine.create();

    if (!props.gravity) {
      this.engine.gravity.scale = 0;
    }

    registerEngineEvents(this.engine, this);

    const renderer = Render.create({
      element: document.body,
      engine: this.engine,
    });

    Render.run(renderer);
  }

  bodies: Map<ComponentId, Matter.Body> = new Map();

  _addBody(component: ComponentId, body: Matter.Body) {
    this.bodies.set(component, body);
    Composite.add(this.engine.world, body);
  }

  _removeBody(component: ComponentId) {
    const body = this.bodies.get(component);
    if (body) {
      Composite.remove(this.engine.world, body);
      this.bodies.delete(component);
    }
  }

  _lastPhysicsUpdate = 0;

  onUpdate({ deltaTime, entities }: SystemUpdateProps) {
    WolfPerformance.start("physics");

    WolfPerformance.start("rigid-body-linking");
    const rigidBodies = entities.filter((entity) =>
      entity.hasComponent(RigidBody2D)
    );

    WolfPerformance.end("rigid-body-linking");

    // Only update physics at 30fps
    WolfPerformance.start("engine-update");
    Engine.update(this.engine, deltaTime);
    WolfPerformance.end("engine-update");

    // Patch position of Transform to match rigid bodies
    WolfPerformance.start("transform-patching");
    rigidBodies.forEach((entity) => {
      const rigidBody = entity.requireComponent(RigidBody2D);
      const transform = entity.requireComponent(Transform2D);
      const body = this.bodies.get(rigidBody.id);
      if (!body) return;
      const { x, y } = body.position;
      const angle = body.angle;
      transform.setGlobalPosition(x, y);
      transform.setGlobalRotation(angle);
    });
    WolfPerformance.end("transform-patching");
    WolfPerformance.end("physics");
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
      }
    }
  });
}
