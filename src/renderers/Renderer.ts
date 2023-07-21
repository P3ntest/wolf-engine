import { Entity } from "../Entity";
import { Scene } from "../Scene";
import { System } from "../System";
import { Vector2 } from "../utils/vector";

export interface WorldRenderer extends Renderer {
  transformScreenToWorld(screenPos: Vector2): Vector2;
}

export type DrawProps = {
  deltaTime: number;
  entities: Entity[];
  scene: Scene;
};

export abstract class Renderer extends System {
  abstract draw({ deltaTime, entities }: DrawProps): void;
}
