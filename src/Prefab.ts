import { Entity, EntityParent } from "./Entity";

type InstantiateFunction<Props> = (
  entity: Entity,
  props: Partial<Props>
) => void;

export class Prefab<Props> {
  _instantiateFn: InstantiateFunction<Props>;
  name: string;
  constructor(name: string, instantiate: InstantiateFunction<Props>) {
    this._instantiateFn = instantiate;
    this.name = name;

    if (Prefab.prefabs.has(name)) {
      throw new Error(`Prefab with name ${name} already exists`);
    }

    Prefab.prefabs.set(name, this);
  }

  static prefabs = new Map<string, Prefab<any>>();

  static instantiate<Props = {}>(name: string, props: Partial<Props>) {
    const prefab = Prefab.prefabs.get(name);

    if (!prefab) {
      throw new Error(`Prefab with name ${name} not found`);
    }

    prefab.instantiate(props);
  }

  instantiate(props: Partial<Props>): Entity {
    const entity = new Entity();
    this._instantiateFn(entity, props);

    return entity;
  }
}
