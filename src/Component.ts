import { Entity } from "./Entity";
import { UpdateProps } from "./Ticker";

export type ComponentId = `c_${string}`;

function genComponentId(): ComponentId {
  return `c_${Math.random().toString(36).substr(2, 9)}`;
}

export interface ComponentUpdateProps extends UpdateProps {}

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
  onUpdate?(props: ComponentUpdateProps) {}
  renderDebug?(): any;

  static fromMethods(methods: {
    onAttach?(this: Component): void;
    onUpdate?(this: Component, props: ComponentUpdateProps): void;
    renderDebug?(this: Component): any;
  }): Component {
    return new MethodComponent(methods);
  }
}

class MethodComponent extends Component {
  constructor(public methods: any) {
    super();
    this.onAttach = methods.onAttach;
    this.onUpdate = methods.onUpdate;
    this.renderDebug = methods.renderDebug;
  }
}
