import { Component } from "./Component";
import { Scene } from "./Scene";

export type EntityId = `e_${string}`;

function genEntityId(): EntityId {
  return `e_${Math.random().toString(36).substr(2, 9)}`;
}

export class Entity {
  components: Component[] = [];
  id: EntityId = genEntityId();

  children: Entity[] = [];

  _parent: Entity | Scene | null = null;
  get parent(): Entity | Scene {
    if (!this._parent) {
      throw new Error("Entity not attached to parent");
    }
    return this._parent;
  }

  createEntity(): Entity {
    const child = new Entity();
    this.addEntity(child);
    return child;
  }

  update(deltaTime: number) {
    this.components.forEach((component) => {
      if (component.onUpdate) {
        component.onUpdate(deltaTime);
      }
    });

    this.children.forEach((child) => {
      child.update(deltaTime);
    });
  }

  private addEntity(entity: Entity) {
    entity._parent = this;
    this.children.push(entity);
  }

  addComponents(...components: Component[]) {
    components.forEach((component) => {
      this.addComponent(component);
    });
  }

  addComponent(component: Component) {
    component._entity = this;
    this.components.push(component);
  }

  hasComponent<T extends Component>(componentType: new () => T): boolean {
    return this.components.some((c) => c instanceof componentType);
  }

  requireComponent<T extends Component>(componentType: new () => T): T {
    const component = this.getComponent(componentType);
    if (!component) {
      throw new Error(
        `Entity ${this.id} does not have component ${componentType.name}`
      );
    }

    return component;
  }

  getComponent<T extends Component>(componentType: new () => T): T | null {
    return (this.components.find((c) => c instanceof componentType) ??
      null) as T | null;
  }

  getComponents<T extends Component>(componentType: new () => T): T[] {
    return this.components.filter((c) => c instanceof componentType) as T[];
  }
}
