import { Component } from "../Component";
import { Entity } from "../Entity";
import { WolfPerformance } from "../Performance";
import { Transform2D } from "../components/Transform2D";
import { Vector2 } from "../utils/vector";
import { DrawProps, Renderer, WorldRenderer } from "./Renderer";
import * as PIXI from "pixi.js";

export class PIXIRenderer extends Renderer implements WorldRenderer {
  app: PIXI.Application;

  width: number = 800;
  height: number = 600;

  constructor(htmlElement: HTMLElement, public zoom: number = 100) {
    super();

    this.app = new PIXI.Application({
      width: this.width,
      height: this.height,
    });

    this.app.ticker.stop();

    htmlElement.appendChild(this.app.view as HTMLCanvasElement);

    window.addEventListener("resize", () => {
      this._updateWindowSize();
    });

    this._updateWindowSize();
  }

  _updateWindowSize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.app.renderer.resize(this.width, this.height);
  }

  transformScreenToWorld(screenPos: Vector2): Vector2 {
    const zoom = this.app.stage.scale.x;

    const cameraDelta = screenPos
      .subtract(new Vector2(this.width, this.height).multiplyScalar(0.5))
      .multiplyScalar(1 / zoom)
      .multiplyScalar(1 / this.zoom);

    const camera = this.scene.getAllEntities().find((entity) => {
      return entity.hasComponent(Camera2D);
    });

    const camPos = camera?.transform2D.getGlobalPosition() ?? new Vector2();

    return camPos.add(cameraDelta);
  }

  _updateComponent(
    component: Object2D,
    object: PIXI.Container,
    props: DrawProps | null
  ): void {
    const transform = component.entity.requireComponent(Transform2D);
    const position = transform.getGlobalPosition().multiplyScalar(this.zoom);
    const rotation = transform.getGlobalRotation();

    object.position.set(position.x, position.y);
    object.rotation = rotation;

    if (props != null && component.draw) {
      component.draw(props);
    }
  }

  draw(props: DrawProps) {
    WolfPerformance.start("render", "object update");
    for (const [component, object] of this.componentContainers.entries()) {
      this._updateComponent(component, object, props);
    }
    WolfPerformance.end("render");

    const scene = props.scene;

    WolfPerformance.start("render", "camera update");
    const camera = scene
      .getAllEntities()
      .find((entity) => {
        return entity.hasComponent(Camera2D);
      })
      ?.requireComponent(Camera2D);

    if (camera) {
      this.app.stage.scale.set(camera.zoom);
      const screenVec = new Vector2(this.width, this.height).multiplyScalar(
        0.5
      );

      const camWorldPos = camera.entity
        .requireComponent(Transform2D)
        .getGlobalPosition()
        .multiplyScalar(-this.zoom);

      const zoomOffset = camWorldPos
        .multiplyScalar(camera.zoom)
        .subtract(camWorldPos);

      const pos = camWorldPos.add(screenVec).add(zoomOffset);

      this.app.stage.position.set(pos.x, pos.y);
    }

    WolfPerformance.end("render");

    WolfPerformance.start("render", "pixijs call cycle");
    this.app.render();
    WolfPerformance.end("render");
  }

  componentContainers = new Map<Object2D, PIXI.Container>();
  _registerComponent(component: Object2D): void {
    this.componentContainers.set(component, component.container);
    this._updateComponent(component, component.container, null);
    this.app.stage.addChild(component.container);

    this._updateChildrenZIndex();
  }

  _unregisterComponent(component: Object2D): void {
    this.componentContainers.delete(component);
    this.app.stage.removeChild(component.container);

    this._updateChildrenZIndex();
  }

  _updateChildrenZIndex() {
    this.app.stage.sortChildren();
  }
}

export class Object2D extends Component {
  container: PIXI.Container;
  sprite: PIXI.DisplayObject;

  constructor(
    sprite: PIXI.DisplayObject | (() => PIXI.DisplayObject),
    public zIndex: number = 0
  ) {
    super();
    if (typeof sprite === "function") {
      sprite = sprite();
    }

    if ((sprite as any).anchor) {
      ((sprite as any).anchor as PIXI.ObservablePoint).set(0.5, 0.5);
    }

    this.container = new PIXI.Container();
    this.container.zIndex = zIndex;
    this.container.addChild(sprite);
    this.sprite = sprite;
  }

  draw?(props: DrawProps): void;

  onAttach(): void {
    this.entity.scene.requireRenderer(PIXIRenderer)._registerComponent(this);
  }

  onDestroy(): void {
    this.entity.scene.requireRenderer(PIXIRenderer)._unregisterComponent(this);
  }
}

export class Camera2D extends Component {
  constructor(public zoom: number = 1) {
    super();
  }
}
