import { Entity } from "./Entity";
import { Scene } from "./Scene";
import { UpdateProps } from "./Ticker";

export interface SystemUpdateProps extends UpdateProps {
  scene: Scene;
  entities: Entity[];
}

export interface SystemMethods<T extends System = System> {
  onUpdate?(this: T, props: SystemUpdateProps): void;
}

export abstract class System implements Partial<SystemMethods> {
  _scene?: Scene;
  get scene() {
    if (!this._scene) {
      throw new Error("Scene of System not set");
    }
    return this._scene;
  }
  onUpdate?(props: SystemUpdateProps): void;

  static fromMethods<Context = {}>(
    methods: Partial<SystemMethods<MethodSystem<Context>>>
  ): System {
    return new MethodSystem<Context>(methods);
  }
}

export class MethodSystem<Context> extends System {
  context: Context = {} as Context;

  constructor(public methods: Partial<SystemMethods<MethodSystem<Context>>>) {
    super();
    for (const methodName in methods) {
      if (Object.prototype.hasOwnProperty.call(methods, methodName)) {
        (this[methodName as keyof SystemMethods] as any) =
          methods[methodName as keyof SystemMethods];
      }
    }
  }
}
