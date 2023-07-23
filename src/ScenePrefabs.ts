import { Scene } from "./Scene";
import { Physics2D } from "./physics/Physics2D";
import { PIXIRenderer } from "./renderers/PIXIRenderer";
import { ReactUIRenderer } from "./renderers/ReactUIRenderer";

export const ScenePrefabs = {
  Scene2D: (scene: Scene) => {
    scene.setWorldRenderer(new PIXIRenderer(document.getElementById("game")!));
    scene.setWorldPhysics(new Physics2D());
    scene.addRenderer(new ReactUIRenderer(document.getElementById("ui")!));
  },
};
