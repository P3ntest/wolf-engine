import { Input } from "./Input";
import { Scene } from "./Scene";

interface EngineInitProps {
  gameName: string;
}

const defaultInitProps: EngineInitProps = {
  gameName: "Wolf Engine v2 Game",
};

export class Engine {
  private _props: EngineInitProps;
  private constructor(props: Partial<EngineInitProps>) {
    this._props = { ...defaultInitProps, ...props };
  }

  static get props() {
    return { ...Engine._instance._props };
  }

  private static __instance: Engine | null;
  static get _instance() {
    if (!Engine.__instance) {
      throw new Error("Engine not initialized");
    }
    return Engine.__instance;
  }

  static init(props: Partial<EngineInitProps> = {}) {
    printInitMessages();
    Engine.__instance = new Engine(props);
    setHtmlTitle();
  }

  private scenePrefabs: Map<string, ScenePrefab> = new Map();

  static registerScene(name: string, prefab: ScenePrefab) {
    Engine._instance.scenePrefabs.set(name, prefab);
  }

  private runningScene: Scene | null = null;
  private runningSceneName: string | null = null;

  static stopScene() {
    if (Engine._instance.runningScene) {
      Engine._instance.runningScene._destroy();
      Engine._instance.runningScene = null;
      Engine._instance.runningSceneName = null;
    }
  }

  static startScene(name: string) {
    Engine.stopScene();

    setupHtml();

    const scenePrefab = Engine._instance.scenePrefabs.get(name);

    if (!scenePrefab) {
      throw new Error(`Scene ${name} not found`);
    }

    const scene = Scene._instantiate();
    scenePrefab(scene);

    Engine._instance.runningScene = scene;
    Engine._instance.runningSceneName = name;

    scene.start();
  }

  static restartScene() {
    if (!Engine._instance.runningSceneName) {
      throw new Error("No scene running");
    }

    Engine.startScene(Engine._instance!.runningSceneName!);
  }
}

function setupHtml() {
  // reset the body to be empty
  document.body.innerHTML = "";

  // remove margin from body and html
  document.body.style.margin = "0";
  document.body.style.padding = "0";
  document.body.style.overflow = "hidden";

  function createDiv(id: string) {
    const div = document.createElement("div");
    div.id = id;
    document.body.appendChild(div);
    return div;
  }

  createDiv("debug");
  createDiv("ui");
  const gameDiv = createDiv("game");
  Input._setGameElement(gameDiv);
}

function setHtmlTitle() {
  document.title = Engine.props.gameName;
}

export type ScenePrefab = (scene: Scene) => void;

function printInitMessages() {
  // super duper very important do not delete engine will break
  console.log(
    "%cWolf Engine",
    "color: #4f55f7; font-size: 35px; font-weight: bold; text-shadow: 5px 5px #000000;"
  );
  console.log(
    "%cby Julius https://github.com/p3ntest",
    "color: #ffffff; font-size: 10px; font-weight: bold; text-shadow: 2px 2px #4f55f7;"
  );
}
