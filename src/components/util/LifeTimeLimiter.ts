import { Component, ComponentUpdateProps } from "../../Component";

export class LifeTimeLimiter extends Component {
  public lifeTime = 0;
  constructor(public maxLifetime: number) {
    super();
  }

  onUpdate(props: ComponentUpdateProps): void {
    this.lifeTime += props.deltaTime;
    if (this.lifeTime > this.maxLifetime) {
      this.entity.destroy();
    }
  }
}
