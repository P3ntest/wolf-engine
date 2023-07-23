import { Component } from "../Component";
import { Graphics2D } from "../physics/Shape2D";
import { Object2D } from "../renderers/PIXIRenderer";
import * as PIXIParticles from "@pixi/particle-emitter";
import { DrawProps } from "../renderers/Renderer";

export interface Particles2DProps {
  scale?: number;
  autostart?: boolean;
}

export class Particles2D extends Object2D {
  emitter: PIXIParticles.Emitter;
  props: Particles2DProps;
  constructor(
    particles: PIXIParticles.EmitterConfigV3,
    props: Particles2DProps = {}
  ) {
    const container = new Graphics2D.Container();
    super(container);

    container.scale.set(props.scale ?? 1);

    this.props = props;

    this.emitter = new PIXIParticles.Emitter(container, particles);
  }

  onAttach(): void {
    super.onAttach();
    if (this.props.autostart) {
      this.start();
    }
  }

  private running = false;
  start() {
    this.running = true;
    this.emitter.emit = true;
  }

  draw({ deltaTime }: DrawProps): void {
    if (!this.running) return;
    this.emitter.update(deltaTime / 1000);
  }

  static from(
    particles: PIXIParticles.EmitterConfigV2 | PIXIParticles.EmitterConfigV1,
    art: any[]
  ) {
    return PIXIParticles.upgradeConfig(particles, art);
  }
}
