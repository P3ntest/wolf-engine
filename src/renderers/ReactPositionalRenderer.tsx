import { Root, createRoot } from "react-dom/client";
import { Scene } from "../Scene";
import { System, SystemUpdateProps } from "../System";
import { Entity } from "../Entity";
import { Component } from "../Component";
import { Vector2 } from "../utils/vector";
import { Transform2D } from "../components/Transform2D";
import { FpsCounter } from "../utils/fps";
import { Renderer } from "./Renderer";

export class ReactPositionalRenderer extends Renderer {
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

  constructor(htmlElement: HTMLElement, backgroundColor: string = "#CCCCAA") {
    super();
    this.root = createRoot(htmlElement);
    this.backgroundColor = backgroundColor;
  }
  draw({ deltaTime, scene }: SystemUpdateProps) {
    this.root.render(
      <Screen scene={scene} backgroundColor={this.backgroundColor} />
    );
  }
}

function Screen({
  scene,
  backgroundColor,
}: {
  scene: Scene;
  backgroundColor: string;
}) {
  // Find the camera
  const camera = scene.getAllEntities().find((entity) => {
    return entity.hasComponent(ReactPositionalCamera);
  });

  const camPos =
    camera?.getComponent(Transform2D)?.getGlobalPosition() ?? new Vector2();
  const camRot = camera?.getComponent(Transform2D)?.getGlobalRotation() ?? 0;
  const cameraZoom = camera?.getComponent(ReactPositionalCamera)?.zoom ?? 1;

  const camPosZoomed = camPos.multiplyScalar(cameraZoom);

  const getScreenPosition = (worldPosition: Vector2): Vector2 => {
    const zoomedPos = worldPosition.multiplyScalar(cameraZoom);
    const relativePos = zoomedPos.subtract(camPosZoomed).rotate(-camRot);

    const screenVec = new Vector2(
      window.innerWidth,
      window.innerHeight
    ).multiplyScalar(0.5);
    // .rotate(-camRot);

    return relativePos.add(screenVec);
  };

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
      <EntitiesRenderer
        getScreenPosition={getScreenPosition}
        cameraRotation={camRot}
        zoom={cameraZoom}
        entities={scene
          .getAllEntities()
          .filter((e) => e.hasComponent(ReactRenderedComponent))}
      />
    </div>
  );
}

function EntitiesRenderer({
  entities,
  getScreenPosition,
  cameraRotation,
  zoom,
}: {
  entities: Entity[];
  cameraRotation: number;
  getScreenPosition: (worldPosition: Vector2) => Vector2;
  zoom: number;
}) {
  return (
    <>
      {entities.map((entity) => {
        const components = entity.getComponents(ReactRenderedComponent);
        return components.map((component) => {
          const worldPosition: Vector2 =
            entity.getComponent(Transform2D)?.getGlobalPosition() ??
            new Vector2();

          const worldRotation: number =
            entity.getComponent(Transform2D)?.getGlobalRotation() ?? 0;

          // Get the position relative to the camera
          const screenPosition = getScreenPosition(worldPosition);
          const screenRotation = worldRotation - cameraRotation;

          return (
            <div
              key={component.id}
              style={{
                position: "absolute",
                top: screenPosition.y,
                left: screenPosition.x,
                transform: `translate(-50%, -50%) scale(${zoom})`,
                zIndex: component.layer,
              }}
            >
              <div
                style={{
                  transform: `rotate(${screenRotation}rad)`,
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

export class ReactPositionalCamera extends Component {
  zoom = 1;
  constructor(zoom: number = 1) {
    super();
    this.zoom = zoom;
  }

  setZoom(zoom: number) {
    this.zoom = zoom;
  }
}
