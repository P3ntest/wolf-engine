import { Component, ComponentId } from "./Component";
import { Entity } from "./Entity";
import { Input } from "./Input";
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

    Input.instance._resetFrame();
  }

  getComponentById(id: ComponentId): Component | null {
    for (const entity of this.getAllEntities()) {
      for (const component of entity.components) {
        if (component.id === id) {
          return component;
        }
      }
    }
    return null;
  }

  addSystem(system: System) {
    system._scene = this;
    this.systems.push(system);
  }

  addRenderer(renderer: System) {
    renderer._scene = this;
    this.renderers.push(renderer);
  }

  _removeEntity(entity: Entity) {
    this.entities = this.entities.filter((e) => e !== entity);
  }

  createEntity(): Entity {
    const entity = new Entity();

    this.addEntity(entity);

    return entity;
  }

  private addEntity(entity: Entity) {
    this.entities.push(entity);
    entity._onAttach();
    entity._parent = this;
  }
}
