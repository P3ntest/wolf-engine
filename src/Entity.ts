import { Component } from "./Component";
import { Scene } from "./Scene";
import { UpdateProps } from "./Ticker";
import { RigidBody2D } from "./components/RigidBody2D";
import { Transform2D } from "./components/Transform2D";
export type EntityId = `e_${string}`;

function genEntityId(): EntityId {
  return `e_${Math.random().toString(36).substr(2, 9)}`;
}

export interface EntityParent {
  attachEntity(entity: Entity): void;
  getAllEntities(): Entity[];
  _removeEntity(entity: Entity): void;
}

export interface EntityUpdateProps extends UpdateProps {}

export class Entity implements EntityParent {
  components: Component[] = [];
  id: EntityId = genEntityId();

  children: Entity[] = [];

  get scene(): Scene {
    if (this.parent instanceof Scene) {
      return this.parent;
    } else return (this.parent as Entity).scene;
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

  _parent: EntityParent | null = null;
  get parent(): EntityParent {
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
    if (this._attached) entity._onAttach(this);
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

  _onAttach(parent: EntityParent) {
    if (this._attached) throw new Error("Entity already attached");
    this._attached = true;
    this._parent = parent;

    const components = [...this.components];
    this.components = [];

    components.forEach((component) => {
      this.components.push(component);
      component._attach(this);
      if (component.onAttach) {
        component.onAttach();
      }
    });
    // components.forEach((component) => {
    //   if (component.onAttach) {
    //     component.onAttach();
    //   }
    // });

    this.children.forEach((child) => {
      child._onAttach(this);
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

  _transform2D: Transform2D | null = null;
  get transform2D() {
    if (this._transform2D) return this._transform2D;
    this._transform2D = this.requireComponent(Transform2D);
    return this._transform2D;
  }
  _rigidBody2D: RigidBody2D | null = null;
  get rigidBody2D() {
    if (this._rigidBody2D) return this._rigidBody2D;
    this._rigidBody2D = this.requireComponent(RigidBody2D);
    return this._rigidBody2D;
  }
}

export type ComponentConstructor<T extends Component> = new (
  ...props: any[]
) => T;
