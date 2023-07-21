import { WorldRenderer } from "./renderers/ReactPositionalRenderer";
import { Component, ComponentId } from "./Component";
import { Entity, EntityParent } from "./Entity";
import { Input } from "./Input";
import { System } from "./System";
import { Renderer, Ticker, UpdateProps } from "./Ticker";
import { World } from "matter-js";
import { WolfPerformance } from "./Performance";
export class Scene implements EntityParent {
  private renderers: System[] = [];

  private entities: Entity[] = [];
  private systems: System[] = [];

  ticker: Ticker = new Ticker(this.loop.bind(this));
  rendererTicker: Renderer = new Renderer(this.render.bind(this));
  rendering: boolean = false;

  private render({ deltaTime }: UpdateProps) {
    for (const renderer of this.renderers) {
      if (renderer.onUpdate) {
        renderer.onUpdate({
          deltaTime,
          scene: this,
          entities: this.getAllEntities(),
        });
      }
    }
  }

  start() {
    this.ticker.start();
    this.rendererTicker.start();
  }

  stop() {
    this.ticker.stop();
    this.rendererTicker.stop();
  }

  getRootEntities(): Entity[] {
    return this.entities;
  }

  destroy() {
    this.stop();
    this.entities.forEach((entity) => entity.destroy());
    this.entities = [];
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
    WolfPerformance.start("scene");
    WolfPerformance.start("system-update");
    for (const system of this.systems) {
      if (system.onUpdate) {
        system.onUpdate({
          deltaTime,
          scene: this,
          entities: this.getAllEntities(),
        });
      }
    }
    WolfPerformance.end("system-update");

    WolfPerformance.start("entity-update");
    for (const entity of this.entities) {
      entity.update({ deltaTime });
    }
    WolfPerformance.end("entity-update");

    Input.instance._resetFrame();
    WolfPerformance.end("scene");
  }

  getEntityByTag(tag: string): Entity | null {
    const entities = this.getEntitiesByTag(tag);
    if (entities.length > 1) {
      console.warn(
        `Multiple entities with tag ${tag} found in scene during getEntityByTag call`
      );
    }
    return entities[0] || null;
  }

  getEntitiesByTag(tag: string): Entity[] {
    return this.entities.filter((entity) => entity.hasTag(tag));
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

  _worldPhysics: System | null = null;

  get worldPhysics(): System {
    if (!this._worldPhysics) {
      throw new Error("WorldPhysics not set");
    }
    return this._worldPhysics;
  }
  setWorldPhysics(physics: System) {
    this.addSystem(physics);
    this._worldPhysics = physics;
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
