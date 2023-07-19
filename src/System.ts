import { Entity } from "./Entity";
import { Scene } from "./Scene";
import { UpdateProps } from "./Ticker";

export interface SystemUpdateProps extends UpdateProps {
  scene: Scene;
  entities: Entity[];
}

export abstract class System {
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
