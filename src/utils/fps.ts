export class FpsCounter {
  fps: number = 0;
  times: number[] = [];

  lastFps: number[] = [];

  constructor() {}

  update(): typeof this {
    const now = performance.now();
    while (this.times.length > 0 && this.times[0] <= now - 1000) {
      this.times.shift();
    }
    this.times.push(now);
    this.fps = this.times.length;

    this.lastFps.push(this.fps);
    if (this.lastFps.length > 120) {
      this.lastFps.shift();
    }

    return this;
  }

  lastAverage: number = 0;
  lastAverageTime: number = 0;

  getFpsAverage(): number {
    if (performance.now() - this.lastAverageTime > 1000) {
      this.lastAverage = Math.round(
        this.lastFps.reduce((a, b) => a + b, 0) / this.lastFps.length
      );

      this.lastAverageTime = performance.now();
    }
    return this.lastAverage;
  }

  getFpsExact(): number {
    return this.fps;
  }
}
