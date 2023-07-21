function translateKey(key: string): string {
  if (key === " ") {
    return "Space";
  }

  return key.toLowerCase();
}

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
      const key = translateKey(e.key);
      if (!Input.instance.keys.get(key)) {
        Input.instance.keyDowns.push(key);
      }

      Input.instance.keys.set(key, true);
    });

    window.addEventListener("keyup", (e) => {
      const key = translateKey(e.key);
      if (Input.instance.keys.get(key)) {
        Input.instance.keyUps.push(key);
      }

      Input.instance.keys.set(key, false);
    });

    window.addEventListener("mousedown", (e) => {
      if (!Input.instance.keys.get("mouse0")) {
        Input.instance.keyDowns.push("mouse0");
      }
      Input.instance.keys.set("mouse0", true);
      e.preventDefault();
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

    window.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });

    window.addEventListener("wheel", (e) => {
      const direction = e.deltaY > 0 ? 1 : -1;
      if (direction > 0) {
        Input.instance.keyDowns.push("scrolldown");
        Input.instance.keys.set("scrolldown", true);
      } else {
        Input.instance.keyDowns.push("scrollup");
        Input.instance.keys.set("scrollup", true);
      }
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

    // filter scroll keys out
    this.keys.set("scrollDown", false);
    this.keys.set("scrollUp", false);
  }

  axes: Axis[] = [];

  static getAxis(axisName: string): number {
    const axis = Input.instance.axes.find((a) => a.name === axisName);

    if (!axis) {
      throw new Error(
        `Axis ${axisName} not found. Have you initialized input?`
      );
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
    return Input.instance.keys.get(translateKey(key)) ?? false;
  }

  static getKeyDown(key: string): boolean {
    return Input.instance.keyDowns.includes(translateKey(key));
  }

  static getKeyUp(key: string): boolean {
    return Input.instance.keyUps.includes(translateKey(key));
  }
}

interface Axis {
  name: string;
  positiveKeys: string[];
  negativeKeys: string[];
}
