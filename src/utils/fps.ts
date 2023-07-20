export class FpsCounter {
  fps: number = 0;
  times: number[] = [];

  constructor() {}

  update() {
    const now = performance.now();
    while (this.times.length > 0 && this.times[0] <= now - 1000) {
      this.times.shift();
    }
    this.times.push(now);
    this.fps = this.times.length;

    return this.fps;
  }
}
