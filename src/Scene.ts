import { Entity } from "./Entity";
import { System } from "./System";
import { Ticker, UpdateProps } from "./Ticker";
export class Scene {
  private renderers: System[] = [];

  private entities: Entity[] = [];
  private systems: System[] = [];
  ticker: Ticker = new Ticker((deltaTime) => this.loop(deltaTime));

  getRootEntities(): Entity[] {
    return this.entities;
  }

  getAllEntities(): Entity[] {
    const entities: Entity[] = [];
    entities.push(...this.entities);
    entities.forEach((entity) => {
      entities.push(...entity.getAllChildren());
    });

    return entities;
  }

  private loop({ deltaTime }: UpdateProps) {
    this.systems.forEach((system) => {
      if (system.onUpdate) {
        system.onUpdate({
          deltaTime,
          scene: this,
          entities: this.getAllEntities(),
        });
      }
    });

    this.entities.forEach((entity) => {
      entity.update({ deltaTime });
    });

    this.renderers.forEach((renderer) => {
      if (renderer.onUpdate) {
        renderer.onUpdate({
          deltaTime,
          scene: this,
          entities: this.getAllEntities(),
        });
      }
    });
  }

  addSystem(system: System) {
    this.systems.push(system);
  }

  addRenderer(renderer: System) {
    this.renderers.push(renderer);
  }

  createEntity(): Entity {
    const entity = new Entity();

    this.addEntity(entity);

    return entity;
  }

  private addEntity(entity: Entity) {
    this.entities.push(entity);
    entity._parent = this;
  }
}
