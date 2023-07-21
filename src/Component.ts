import { ComponentConstructor, Entity } from "./Entity";
import { UpdateProps } from "./Ticker";
import { RigidBody2D } from "./components/RigidBody2D";

export type ComponentId = `c_${string}`;

function genComponentId(): ComponentId {
  return `c_${Math.random().toString(36).substr(2, 9)}`;
}

export interface ComponentUpdateProps extends UpdateProps {}

interface ComponentMethods<T extends Component = Component> {
  onAttach(this: T): void;
  onUpdate(this: T, props: ComponentUpdateProps): void;
  renderDebug(this: T): any;
  onCollisionStart2D(this: T, other: RigidBody2D): void;
  onCollisionEnd2D(this: T, other: RigidBody2D): void;
  onDestroy(this: T): void;
}

export abstract class Component implements Partial<ComponentMethods> {
  _entity: Entity | null = null;

  _attached = false;

  get scene() {
    return this.entity.scene;
  }

  _doUpdate(props: ComponentUpdateProps) {
    if (!this._attached) {
      this._attached = true;
      if (this.onAttach) {
        this.onAttach();
      }
    }
    if (this.onUpdate) {
      this.onUpdate(props);
    }
  }

  _attach(entity: Entity) {
    this._entity = entity;
    this._attached = true;
  }

  get entity(): Entity {
    if (!this._entity) {
      throw new Error("Component not attached to entity");
    }
    return this._entity;
  }
  id: ComponentId = genComponentId();

  onAttach?(): void;
  onUpdate?(props: ComponentUpdateProps): void;
  renderDebug?(): any;
  onCollisionStart2D?(other: Component): void;
  onCollisionEnd2D?(this: Component, other: RigidBody2D): void;
  onDestroy?(): void;

  static fromMethods<Context = {}>(
    methods: Partial<ComponentMethods<MethodComponent<Context>>> & {
      setupContext?: (this: MethodComponent<Context>) => void;
    }
  ): Component {
    return new MethodComponent<Context>(methods);
  }
}

class MethodComponent<Context> extends Component {
  context: Context = {} as Context;
  constructor(
    public methods: Partial<ComponentMethods<MethodComponent<Context>>> & {
      setupContext?: (this: MethodComponent<Context>) => void;
    }
  ) {
    super();

    for (const methodName in methods) {
      if (Object.prototype.hasOwnProperty.call(methods, methodName)) {
        (this[methodName as keyof ComponentMethods] as any) =
          methods[
            methodName as keyof ComponentMethods<MethodComponent<Context>>
          ];
      }
    }

    if (methods.setupContext) {
      methods.setupContext.call(this);
    }
  }
}
