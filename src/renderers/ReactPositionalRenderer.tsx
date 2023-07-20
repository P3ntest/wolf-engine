import { Root, createRoot } from "react-dom/client";
import { Scene } from "../Scene";
import { System, SystemUpdateProps } from "../System";
import { Entity } from "../Entity";
import { Component } from "../Component";
import { Vector2 } from "../utils/vector";
import { Transform2D } from "../components/Transform2D";
import { FpsCounter } from "../utils/fps";

export interface WorldRenderer extends System {
  transformScreenToWorld(screenPosition: Vector2): Vector2;
}

export class ReactPositionalRenderer extends System implements WorldRenderer {
  root: Root;
  backgroundColor: string;

  transformScreenToWorld(screenPosition: Vector2): Vector2 {
    const camera = this.scene.getAllEntities().find((entity) => {
      return entity.hasComponent(ReactPositionalCamera);
    });

    const camPos =
      camera?.getComponent(Transform2D)?.getGlobalPosition() ?? new Vector2();
    const camRot = camera?.getComponent(Transform2D)?.getGlobalRotation() ?? 0;

    const screenVec = new Vector2(window.innerWidth, window.innerHeight)
      .multiplyScalar(0.5)
      .rotate(camRot);

    camPos.x -= screenVec.x;
    camPos.y -= screenVec.y;

    return screenPosition.add(camPos).rotate(camRot);
  }

  fpsCounter: FpsCounter = new FpsCounter();

  constructor(htmlElement: HTMLElement, backgroundColor: string = "#CCCCAA") {
    super();
    this.root = createRoot(htmlElement);
    this.backgroundColor = backgroundColor;
  }
  onUpdate({ deltaTime, scene }: SystemUpdateProps) {
    const fps = this.fpsCounter.update().getFpsAverage();

    this.root.render(
      <Screen scene={scene} backgroundColor={this.backgroundColor} fps={fps} />
    );
  }
}

function Screen({
  scene,
  backgroundColor,
  fps,
}: {
  scene: Scene;
  backgroundColor: string;
  fps: number;
}) {
  // Find the camera
  const camera = scene.getAllEntities().find((entity) => {
    return entity.hasComponent(ReactPositionalCamera);
  });

  const camPos =
    camera?.getComponent(Transform2D)?.getGlobalPosition() ?? new Vector2();
  const camRot = camera?.getComponent(Transform2D)?.getGlobalRotation() ?? 0;

  const screenVec = new Vector2(window.innerWidth, window.innerHeight)
    .multiplyScalar(0.5)
    .rotate(camRot);

  camPos.x -= screenVec.x;
  camPos.y -= screenVec.y;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        backgroundColor,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          color: "white",
          backgroundColor: "black",
          padding: "0.5em",
          zIndex: 10000,
        }}
      >
        FPS: {fps} Entities: {scene.getAllEntities().length}
      </span>
      <EntitiesRenderer
        camPos={camPos}
        camRot={camRot}
        entities={scene
          .getAllEntities()
          .filter((e) => e.hasComponent(ReactRenderedComponent))}
      />
    </div>
  );
}

function EntitiesRenderer({
  entities,
  camRot,
  camPos,
}: {
  entities: Entity[];
  camRot: number;
  camPos: Vector2;
}) {
  return (
    <>
      {entities.map((entity) => {
        const components = entity.getComponents(ReactRenderedComponent);
        return components.map((component) => {
          const localPosition: Vector2 =
            entity.getComponent(Transform2D)?.getGlobalPosition() ??
            new Vector2();

          const localRotation: number =
            entity.getComponent(Transform2D)?.getGlobalRotation() ?? 0;

          // Get the position relative to the camera
          const position = localPosition.subtract(camPos).rotate(-camRot);
          const rotation = localRotation - camRot;

          return (
            <div
              key={component.id}
              style={{
                position: "absolute",
                top: position.y,
                left: position.x,
                transform: `translate(-50%, -50%)`,
                zIndex: component.layer,
              }}
            >
              <div
                style={{
                  transform: `rotate(${rotation}rad)`,
                }}
              >
                {component.renderHtml()}
              </div>
            </div>
          );
        });
      })}
    </>
  );
}

export class ReactRenderedComponent extends Component {
  _renderFn: undefined | (() => JSX.Element | string | null);
  layer: number;

  constructor(renderFn?: () => JSX.Element | string | null, layer: number = 0) {
    super();
    this.layer = layer;
    this._renderFn = renderFn;
  }

  renderHtml(): JSX.Element | string | null {
    return this._renderFn?.() ?? null;
  }
}

export class ReactPositionalCamera extends Component {}
