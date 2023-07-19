import { Root, createRoot } from "react-dom/client";
import { Scene } from "../Scene";
import { System } from "../System";
import { Entity } from "../Entity";
import { Component } from "../Component";
import { Vector2 } from "../utils/vector";
import { Transform2D } from "../components/Transform2D";

export class ReactPositionalRenderer extends System {
  root: Root;
  backgroundColor: string;
  constructor(htmlElement: HTMLElement, backgroundColor: string = "#CCCCAA") {
    super();
    this.root = createRoot(htmlElement);
    this.backgroundColor = backgroundColor;
  }
  onUpdate(deltaTime: number, scene: Scene) {
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
      <EntitiesRenderer entities={scene.entities} />
    </div>
  );
}

function EntitiesRenderer({ entities }: { entities: Entity[] }) {
  return (
    <>
      {entities.map((entity) => (
        <EntitiesRenderer
          entities={entity.children}
          key={"children" + entity.id}
        />
      ))}
      {entities.map((entity) => {
        if (!entity.hasComponent(ReactRenderedComponent)) {
          return null;
        }
        const component = entity.getComponent(ReactRenderedComponent)!;
        const position: Vector2 =
          entity.getComponent(Transform2D)?.getGlobalPosition() ??
          new Vector2();

        return (
          <div
            key={entity.id}
            style={{
              position: "absolute",
              top: position.y,
              left: position.x,
            }}
          >
            {component.renderHtml()}
          </div>
        );
      })}
    </>
  );
}

export class ReactRenderedComponent extends Component {
  _renderFn: undefined | (() => JSX.Element | string | null);

  constructor(renderFn?: () => JSX.Element | string | null) {
    super();
    this._renderFn = renderFn;
  }

  renderHtml(): JSX.Element | string | null {
    return this._renderFn?.() ?? null;
  }
}
