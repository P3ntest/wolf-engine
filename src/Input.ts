import { WorldRenderer } from "./renderers/ReactPositionalRenderer";

export class Input {
  static instance = new Input();

  static defineAxis(
    axisName: string,
    positiveKeys: string[],
    negativeKeys: string[]
  ) {
    Input.instance.axes.push({
      name: axisName,
      positiveKeys,
      negativeKeys,
    });
  }

  static init() {
    Input.instance = new Input();

    Input.instance.axes.push(
      {
        name: "Horizontal",
        positiveKeys: ["ArrowRight", "d"],
        negativeKeys: ["ArrowLeft", "a"],
      },
      {
        name: "Vertical",
        positiveKeys: ["ArrowDown", "s"],
        negativeKeys: ["ArrowUp", "w"],
      }
    );

    window.addEventListener("keydown", (e) => {
      if (!Input.instance.keys.get(e.key)) {
        Input.instance.keyDowns.push(e.key);
      }

      Input.instance.keys.set(e.key, true);
    });

    window.addEventListener("keyup", (e) => {
      if (Input.instance.keys.get(e.key)) {
        Input.instance.keyUps.push(e.key);
      }

      Input.instance.keys.set(e.key, false);
    });

    window.addEventListener("mousedown", () => {
      if (!Input.instance.keys.get("mouse0")) {
        Input.instance.keyDowns.push("mouse0");
      }
      Input.instance.keys.set("mouse0", true);
    });

    window.addEventListener("mouseup", () => {
      if (Input.instance.keys.get("mouse0")) {
        Input.instance.keyUps.push("mouse0");
      }
      Input.instance.keys.set("mouse0", false);
    });

    window.addEventListener("mousemove", (e) => {
      Input.instance.mousePosition = {
        x: e.clientX,
        y: e.clientY,
      };
    });
  }

  mousePosition: { x: number; y: number } = { x: 0, y: 0 };

  static getMousePosition(): { x: number; y: number } {
    return Input.instance.mousePosition;
  }

  keys = new Map<string, boolean>();

  keyDowns: string[] = [];
  keyUps: string[] = [];

  _resetFrame() {
    this.keyDowns = [];
    this.keyUps = [];
  }

  axes: Axis[] = [];

  static getAxis(axisName: string): number {
    const axis = Input.instance.axes.find((a) => a.name === axisName);

    if (!axis) {
      throw new Error(`Axis ${axisName} not found`);
    }

    let value = 0;

    axis.positiveKeys.forEach((key) => {
      if (Input.getKey(key)) {
        value += 1;
      }
    });

    axis.negativeKeys.forEach((key) => {
      if (Input.getKey(key)) {
        value -= 1;
      }
    });

    return value;
  }

  static getKey(key: string): boolean {
    return Input.instance.keys.get(key) ?? false;
  }

  static getKeyDown(key: string): boolean {
    return Input.instance.keyDowns.includes(key);
  }

  static getKeyUp(key: string): boolean {
    return Input.instance.keyUps.includes(key);
  }
}

interface Axis {
  name: string;
  positiveKeys: string[];
  negativeKeys: string[];
}
