import { Component, ComponentId } from "./Component";
import { Entity, EntityParent } from "./Entity";
import { Input } from "./Input";
import { System } from "./System";
import { RenderTicker, GameLoopTicker, UpdateProps } from "./Ticker";
import { World } from "matter-js";
import { WolfPerformance } from "./Performance";
import { PhysicsSystem } from "./physics/Physics2D";
import { Renderer, WorldRenderer } from "./renderers/Renderer";
export class Scene implements EntityParent {
  private renderers: Renderer[] = [];

  private entities: Entity[] = [];
  private systems: System[] = [];

  ticker: GameLoopTicker = new GameLoopTicker(this.physicsUpdate.bind(this));
  rendererTicker: RenderTicker = new RenderTicker(this.render.bind(this));
  rendering: boolean = false;

  private render({ deltaTime }: UpdateProps) {
    WolfPerformance.start("render");
    for (const renderer of this.renderers) {
      renderer.draw({
        deltaTime,
        scene: this,
        entities: this.getAllEntities(),
      });
    }
    WolfPerformance.end("render");
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

  private physicsUpdate({ deltaTime }: UpdateProps) {
    WolfPerformance.start("physics");
    WolfPerformance.start("physics", "system update");
    for (const system of this.systems) {
      if (system.onUpdate) {
        system.onUpdate({
          deltaTime,
          scene: this,
          entities: this.getAllEntities(),
        });
      }
    }
    WolfPerformance.end("physics");

    WolfPerformance.start("physics", "entity-update");
    for (const entity of this.entities) {
      entity.update({ deltaTime });
    }
    WolfPerformance.end("physics");

    WolfPerformance.start("physics", "engine");
    this.worldPhysics.step();
    WolfPerformance.end("physics");

    Input.instance._resetFrame();
    WolfPerformance.end("physics");
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

  requireRenderer<T extends Renderer>(
    rendererClass: new (...args: any[]) => T
  ): T {
    const renderer = this.getRenderer(rendererClass);
    if (!renderer) {
      throw new Error(`Renderer ${rendererClass.name} not found`);
    }
    return renderer;
  }

  getRenderer<T extends Renderer>(
    rendererClass: new (...args: any[]) => T
  ): T | null {
    for (const renderer of this.renderers) {
      if (renderer instanceof rendererClass) {
        return renderer;
      }
    }
    return null;
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

  _worldPhysics: PhysicsSystem | null = null;

  get worldPhysics(): PhysicsSystem {
    if (!this._worldPhysics) {
      throw new Error("WorldPhysics not set");
    }
    return this._worldPhysics;
  }
  setWorldPhysics(physics: PhysicsSystem) {
    this.addSystem(physics);
    this._worldPhysics = physics;
  }

  setWorldRenderer(renderer: WorldRenderer) {
    if (!this.renderers.includes(renderer)) {
      this.addRenderer(renderer);
    }
    this._worldRenderer = renderer;
  }

  addRenderer(renderer: Renderer) {
    renderer._scene = this;
    this.renderers.push(renderer);
  }

  _removeEntity(entity: Entity) {
    this.entities = this.entities.filter((e) => e !== entity);
  }

  attachEntity(entity: Entity): void {
    this.entities.push(entity);
    entity._onAttach(this);
  }
}
