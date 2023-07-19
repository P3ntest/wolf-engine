import { Entity } from "./Entity";

export type ComponentId = `c_${string}`;

function genComponentId(): ComponentId {
  return `c_${Math.random().toString(36).substr(2, 9)}`;
}

export abstract class Component {
  _entity: Entity | null = null;
  get entity(): Entity {
    if (!this._entity) {
      throw new Error("Component not attached to entity");
    }
    return this._entity;
  }
  id: ComponentId = genComponentId();
  onAttach?() {}
  onUpdate?(deltaTime: number) {}
  renderDebug?(): any;
}
