import { System, SystemUpdateProps } from "../System";
import { Root, createRoot } from "react-dom/client";
import { Scene } from "../Scene";
import { Entity } from "../Entity";
import { Component } from "../Component";
import { useState } from "react";

export class DebugRenderer extends System {
  root: Root;
  constructor(htmlElement: HTMLElement) {
    super();
    this.root = createRoot(htmlElement);
  }

  onUpdate({ deltaTime, scene }: SystemUpdateProps) {
    this.root.render(
      <>
        <DebugDropdown>
          <SceneECSDebug scene={scene} />
        </DebugDropdown>
        <span
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            color: "white",
            backgroundColor: "black",
            padding: "0.5em",
            zIndex: 10000,
          }}
        >
          FPS: {scene.rendererTicker.fpsCounter.getFpsAverage()} TPS:{" "}
          {scene.ticker.fpsCounter.getFpsAverage()} Entities:{" "}
          {scene.getAllEntities().length}
        </span>
      </>
    );
  }
}

export function DebugDropdown({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <div
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            backgroundColor: "#FFFFFF",
            border: "1px solid black",
            padding: "1em",
            height: "80vh",
            overflow: "scroll",
            zIndex: 10000,
          }}
        >
          {children}
        </div>
      )}
      <button
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          zIndex: 10000,
        }}
        onClick={() => setOpen(!open)}
      >
        Toggle
      </button>
    </>
  );
}

export function SceneECSDebug({ scene }: { scene: Scene }) {
  return (
    <div>
      <h1>Scene</h1>
      <p>Entities: {scene.getRootEntities().length}</p>
      <ul>
        {scene.getRootEntities().map((entity) => (
          <li key={entity.id}>
            <EntityDebug entity={entity} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function EntityDebug({ entity }: { entity: Entity }) {
  return (
    <div>
      <details>
        <summary>
          <h2>
            Entity (<span>{entity.id}</span>)
          </h2>
        </summary>
        <div>Children: {entity.children.length}</div>
        <ul>
          {entity.children.map((child) => (
            <li key={child.id}>
              <EntityDebug entity={child} />
            </li>
          ))}
        </ul>
        <div>Components: {entity.components.length}</div>
        <ul>
          {entity.components.map((component) => (
            <li key={component.id}>
              <ComponentDebug component={component} />
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}

function ComponentDebug({ component }: { component: Component }) {
  const debug = component.renderDebug ? component.renderDebug() : null;

  return (
    <div>
      <h3>
        {component.constructor.name} ({component.id})
      </h3>
      <div>{debug}</div>
    </div>
  );
}
