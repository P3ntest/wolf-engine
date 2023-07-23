import RAPIER from "@dimforge/rapier2d";
import { Vector2 } from "../utils/vector";

export interface Shape2D {
  _toColliderDesc(): RAPIER.ColliderDesc;
  offset: Vector2;
  rotation: number;
}

interface ShapeProps {
  offset?: Vector2;
  rotation?: number;
}

function fromProps(props?: ShapeProps) {
  return {
    offset: props?.offset ?? Vector2.ZERO,
    rotation: props?.rotation ?? 0,
  };
}

export const Shape2D = {
  circle(radius: number, props?: ShapeProps): Shape2D {
    return {
      _toColliderDesc() {
        return RAPIER.ColliderDesc.ball(radius / 100);
      },
      ...fromProps(props),
    };
  },
  box(width: number, height: number, props?: ShapeProps): Shape2D {
    return {
      _toColliderDesc() {
        return RAPIER.ColliderDesc.cuboid(width / 100 / 2, height / 100 / 2);
      },
      ...fromProps(props),
    };
  },
};

export * as Graphics2D from "pixi.js";
