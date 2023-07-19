export class Ticker {
  running = false;
  lastTime = 0;
  deltaTime = 0;

  constructor(private readonly callback: (deltaTime: number) => void) {
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

    this.deltaTime = time - this.lastTime;
    this.lastTime = time;

    this.callback(this.deltaTime);

    requestAnimationFrame(this.loop);
  }
}
