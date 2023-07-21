import { Root, createRoot } from "react-dom/client";
import { Component } from "../Component";
import { System, SystemUpdateProps } from "../System";
import { Vector2 } from "../utils/vector";
import { Entity } from "../Entity";
import { Scene } from "../Scene";

export class ReactUIRenderer extends System {
  root: Root;
  constructor(root: HTMLElement) {
    super();
    this.root = createRoot(root);
  }

  onUpdate({ scene }: SystemUpdateProps) {
    this.root.render(<UIScreen scene={scene} />);
  }
}

function UIScreen({ scene }: { scene: Scene }) {
  const entities = scene
    .getAllEntities()
    .filter((entity) => entity.hasComponent(ReactUIComponent));

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 1000,
      }}
    >
      {entities.map((entity) => {
        const uiComponents = entity.getComponents(ReactUIComponent);
        return uiComponents.map((uiComponent) => {
          const position = uiComponent.position;

          const anchor = (position.anchor ?? "top-left").split("-");

          const anchorX = anchor[1];
          const anchorY = anchor[0];

          const offset = position.offset;

          const offsetLeft = offset?.x ?? 0;
          const offsetTop = offset?.y ?? 0;

          const left = `${offsetLeft}px`;
          const top = `${offsetTop}px`;

          const transform = `translate(${left}, ${top})`;

          return (
            <div
              key={entity.id}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                justifyContent:
                  anchorX === "center"
                    ? "center"
                    : anchorX === "left"
                    ? "flex-start"
                    : "flex-end",
                alignItems:
                  anchorY === "center"
                    ? "center"
                    : anchorY === "top"
                    ? "flex-start"
                    : "flex-end",
                transform,
                zIndex: 10000 + uiComponent.zIndex,
              }}
            >
              {uiComponent.renderHtml()}
            </div>
          );
        });
      })}
    </div>
  );
}

type VerticalPosition = "top" | "bottom" | "center";
type HorizontalPosition = "left" | "right" | "center";
type Position = `${VerticalPosition}-${HorizontalPosition}`;

interface UIPosition {
  anchor?: Position;
  offset?: Vector2;
}

type renderFn = (this: ReactUIComponent) => JSX.Element | string | null;

export class ReactUIComponent extends Component {
  _renderFn: undefined | renderFn;
  position: UIPosition = {
    anchor: "top-left",
    offset: new Vector2(),
  };

  zIndex = 0;

  constructor(
    renderFn?: renderFn,
    props?: {
      position?: UIPosition;
      zIndex?: number;
    }
  ) {
    super();
    this.position = props?.position ?? this.position;
    this._renderFn = renderFn;
    this.zIndex = props?.zIndex ?? this.zIndex;
  }

  renderHtml(): JSX.Element | string | null {
    return this._renderFn?.() ?? null;
  }
}
