import { Component } from "./Component";
import { Scene } from "./Scene";
import { UpdateProps } from "./Ticker";
export type EntityId = `e_${string}`;

function genEntityId(): EntityId {
  return `e_${Math.random().toString(36).substr(2, 9)}`;
}

export interface EntityParent {
  attachEntity(entity: Entity): void;
  getAllEntities(): Entity[];
}

export interface EntityUpdateProps extends UpdateProps {}

export class Entity implements EntityParent {
  components: Component[] = [];
  id: EntityId = genEntityId();

  children: Entity[] = [];

  get scene(): Scene {
    if (this.parent instanceof Scene) {
      return this.parent;
    }
    return this.parent.scene;
  }

  private tags: Set<string> = new Set();

  addTag(tag: string): typeof this {
    this.tags.add(tag);
    return this;
  }

  removeTag(tag: string): typeof this {
    this.tags.delete(tag);
    return this;
  }

  hasTag(tag: string) {
    return this.tags.has(tag);
  }

  _parent: Entity | Scene | null = null;
  get parent(): Entity | Scene {
    if (!this._parent) {
      throw new Error("Entity not attached to parent");
    }
    return this._parent;
  }

  attachEntity(entity: Entity): void {
    this._addEntity(entity);
  }

  getAllEntities(): Entity[] {
    const children = [...this.children];
    this.children.forEach((child) => {
      children.push(...child.getAllEntities());
    });
    return children;
  }

  update(props: EntityUpdateProps) {
    for (const component of this.components) {
      component._doUpdate(props);
    }

    for (const child of this.children) {
      child.update(props);
    }
  }

  private _addEntity(entity: Entity) {
    entity._parent = this;
    if (this._attached) entity._onAttach();
    this.children.push(entity);
  }

  addComponents(...components: Component[]): typeof this {
    components.forEach((component) => {
      this.addComponent(component);
    });

    return this;
  }

  addComponent(component: Component): typeof this {
    this._addComponent(component);

    return this;
  }

  hasComponent<T extends Component>(
    componentType: new (...props: any[]) => T
  ): boolean {
    return this.components.some((c) => c instanceof componentType);
  }

  requireComponent<T extends Component>(
    componentType: ComponentConstructor<T>
  ): T {
    const component = this.getComponent(componentType);
    if (!component) {
      throw new Error(
        `Entity ${this.id} does not have component ${componentType.name}`
      );
    }

    return component;
  }

  _addComponent(component: Component) {
    this.components.push(component);
    if (this._attached) {
      if (component.onAttach) component.onAttach();
    }
  }

  _removeEntity(entity: Entity) {
    this.children = this.children.filter((c) => c !== entity);
  }

  _attached = false;

  _onAttach() {
    this._attached = true;
    this.components.forEach((component) => {
      component._attach(this);
    });
    this.components.forEach((component) => {
      if (component.onAttach) {
        component.onAttach();
      }
    });

    this.children.forEach((child) => {
      child._onAttach();
    });
  }

  destroy() {
    this.children.forEach((child) => {
      child.destroy();
    });

    this.components.forEach((component) => {
      if (component.onDestroy) {
        component.onDestroy();
      }
    });

    this.parent._removeEntity(this);
  }

  getComponent<T extends Component>(
    componentType: ComponentConstructor<T>
  ): T | null {
    return (this.components.find((c) => c instanceof componentType) ??
      null) as T | null;
  }

  getComponents<T extends Component>(
    componentType: ComponentConstructor<T>
  ): T[] {
    return this.components.filter((c) => c instanceof componentType) as T[];
  }
}

export type ComponentConstructor<T extends Component> = new (
  ...props: any[]
) => T;
