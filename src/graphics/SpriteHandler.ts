import {
  BaseTexture,
  ISpritesheetData,
  SCALE_MODES,
  Spritesheet,
  Texture,
} from "pixi.js";

export class SpriteHandler {
  private static _instance: SpriteHandler | null;
  private static get instance() {
    return this._instance
      ? this._instance
      : (this._instance = new SpriteHandler());
  }

  private constructor() {}

  textures: { name: string; textures: Texture[] }[] = [];

  static async loadSheet(
    textureUrl: string,
    data: ISpritesheetData,
    pixelArt = true
  ) {
    const texture = Texture.from(textureUrl, {
      scaleMode: pixelArt ? SCALE_MODES.NEAREST : SCALE_MODES.LINEAR,
    });
    const sheet = new Spritesheet(texture, data);
    await sheet.parse();

    for (let [name, texture] of Object.entries(sheet.textures)) {
      if (name.includes(".")) {
        name = name.split(".")[0];
      }
      if (!this.instance.textures.find((t) => t.name === name)) {
        this.instance.textures.push({
          name,
          textures: [],
        });
      }
      this.instance.textures
        .find((t) => t.name === name)!
        .textures.push(texture);
    }

    // SpriteHandler.instance.sheets.push(sheet);
  }

  static getTexture(name: string) {
    const texture = this.instance.textures.find((t) => t.name === name)
      .textures[0];
    if (texture) return texture;
    else throw new Error(`Texture ${name} not found`);
  }

  static getTextures(name: string) {
    const textures = this.instance.textures.find(
      (t) => t.name === name
    ).textures;
    if (textures) return textures;
    else throw new Error(`Texture set ${name} not found`);
  }

  static getRandomTexture(name: string) {
    const textures = this.getTextures(name);
    return textures[Math.floor(Math.random() * textures.length)];
  }
}
