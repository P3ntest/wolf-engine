import { GuildExplicitContentFilter } from "discord.js";
import { FpsCounter } from "./utils/fps";

export interface UpdateProps {
  deltaTime: number;
}

export interface TickerSystem {
  fpsCounter: FpsCounter;
}

export class GameLoopTicker implements TickerSystem {
  running = false;
  lastTime = 0;
  deltaTime = 0;
  frequency = 120;

  fpsCounter: FpsCounter = new FpsCounter();

  tick: number = 0;

  constructor(private callback: (props: UpdateProps) => void) {
    this.loop = this.loop.bind(this);
  }

  start() {
    this.running = true;
    this.started = performance.now();
    this.loop();
  }

  stop() {
    this.running = false;
  }

  doTick() {
    this.tick++;
    this.deltaTime = this.lastTime - performance.now();
    this.lastTime = performance.now();
    this.callback({ deltaTime: this.deltaTime });
    this.fpsCounter.update();
  }

  started: number = 0;

  private loop() {
    if (!this.running) {
      return;
    }

    const time = performance.now();

    const ticksExpectedTotal = Math.floor(
      (time - this.started) / (1000 / this.frequency)
    );

    const ticksExpected = ticksExpectedTotal - this.tick;

    if (ticksExpected > 0) {
      for (let i = 0; i < ticksExpected; i++) {
        this.doTick();
      }
    }

    if (ticksExpected > this.frequency) {
      console.warn(
        "lagging behind",
        ticksExpected,
        "or",
        ticksExpected / this.frequency,
        "seconds"
      );
    }

    setTimeout(this.loop, 1000 / (this.frequency * 2));
  }
}

export class RenderTicker implements TickerSystem {
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
