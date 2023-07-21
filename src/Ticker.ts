import { GuildExplicitContentFilter } from "discord.js";
import { FpsCounter } from "./utils/fps";

export interface UpdateProps {
  deltaTime: number;
}

export interface TickerSystem {
  fpsCounter: FpsCounter;
}

export class Ticker implements TickerSystem {
  running = false;
  lastTime = 0;
  deltaTime = 0;
  frequency = 200;

  fpsCounter: FpsCounter = new FpsCounter();

  constructor(private callback: (props: UpdateProps) => void) {
    this.loop = this.loop.bind(this);
  }

  start() {
    this.running = true;
    this.loop();
  }

  stop() {
    this.running = false;
  }

  private loop() {
    if (!this.running) {
      return;
    }

    const time = performance.now();

    this.deltaTime = time - this.lastTime;
    this.lastTime = time;

    if (this.deltaTime > (1000 / this.frequency) * 5) {
      this.deltaTime = 100 / this.frequency;
    }

    if (this.deltaTime < (1000 / this.frequency) * 0.8) {
    } else {
      this.callback({ deltaTime: this.deltaTime });
      this.fpsCounter.update();
    }

    setTimeout(this.loop, 1000 / this.frequency / 2);
  }
}

export class Renderer implements TickerSystem {
  running = false;
  lastTime = 0;
  deltaTime = 0;

  fpsCounter: FpsCounter = new FpsCounter();

  constructor(private readonly callback: (props: UpdateProps) => void) {
    this.loop = this.loop.bind(this);
  }

  start() {
    this.running = true;
    this.loop();
  }

  stop() {
    this.running = false;
  }

  private loop(time: number = 0) {
    if (!this.running) {
      return;
    }

    this.fpsCounter.update();

    this.deltaTime = time - this.lastTime;
    this.lastTime = time;

    this.callback({ deltaTime: this.deltaTime });

    requestAnimationFrame(this.loop);
  }
}
