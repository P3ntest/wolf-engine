import { Entity } from "./Entity";
import { System } from "./System";
import { Ticker } from "./Ticker";

export class Scene {
  entities: Entity[] = [];
  systems: System[] = [];
  ticker: Ticker = new Ticker((deltaTime) => this.loop(deltaTime));

  private loop(time: number = 0) {
    this.systems.forEach((system) => {
      if (system.onUpdate) {
        system.onUpdate(time, this);
      }
    });

    this.entities.forEach((entity) => {
      entity.update(time);
    });
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
