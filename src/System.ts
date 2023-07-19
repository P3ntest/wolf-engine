import { Entity } from "./Entity";
import { Scene } from "./Scene";
import { UpdateProps } from "./Ticker";

export interface SystemUpdateProps extends UpdateProps {
  scene: Scene;
  entities: Entity[];
}

export abstract class System {
  _scene?: Scene;
  get scene() {
    if (!this._scene) {
      throw new Error("Scene of System not set");
    }
    return this._scene;
  }
  onUpdate?(props: SystemUpdateProps): void;
}

export type SystemUpdateFn = (props: SystemUpdateProps) => void;
export class BasicSystem extends System {
  updateFn: SystemUpdateFn;
  constructor(updateFn: SystemUpdateFn) {
    super();
    this.updateFn = updateFn;
  }

  onUpdate(props: SystemUpdateProps) {
    this.updateFn(props);
  }
}
