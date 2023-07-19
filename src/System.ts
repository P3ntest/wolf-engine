import {Scene} from "./Scene";

export abstract class System {
  onUpdate?(deltaTime: number, scene: Scene): void;
}