import { WorldRenderer } from "./renderers/ReactPositionalRenderer";
import { Component, ComponentId } from "./Component";
import { Entity, EntityParent } from "./Entity";
import { Input } from "./Input";
import { System } from "./System";
import { Ticker, UpdateProps } from "./Ticker";
import { World } from "matter-js";
export class Scene implements EntityParent {
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
      entities.push(...entity.getAllEntities());
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

  getSystem<T extends System>(
    systemClass: new (...args: any[]) => T
  ): T | null {
    for (const system of this.systems) {
      if (system instanceof systemClass) {
        return system;
      }
    }
    return null;
  }

  requireSystem<T extends System>(systemClass: new (...args: any[]) => T): T {
    const system = this.getSystem(systemClass);
    if (!system) {
      throw new Error(`System ${systemClass.name} not found`);
    }
    return system;
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

  _worldRenderer: WorldRenderer | null = null;

  get worldRenderer(): WorldRenderer {
    if (!this._worldRenderer) {
      throw new Error("WorldRenderer not set");
    }
    return this._worldRenderer;
  }

  setWorldRenderer(renderer: WorldRenderer) {
    if (!this.renderers.includes(renderer)) {
      this.addRenderer(renderer);
    }
    this._worldRenderer = renderer;
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
    entity._parent = this;
  }
}
