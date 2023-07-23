interface Sound {
  urls: string[];
  volume: number;
  loop: boolean;
}

export class AudioEngine {
  static instance = new AudioEngine();

  sounds = new Map<string, Sound>();

  static registerSound(
    name: string,
    url: string | string[],
    volume: number = 1,
    loop: boolean = false
  ) {
    if (typeof url === "string") {
      url = [url];
    }

    AudioEngine.instance.sounds.set(name, {
      urls: url,
      volume,
      loop,
    });
  }

  static play(name: string, volume: number = 1, loop?: boolean) {
    const sound = AudioEngine.instance.sounds.get(name);

    if (!sound) {
      throw new Error(`Sound ${name} not found`);
    }

    const audio = new Audio(sound.urls[0]);
    audio.volume = sound.volume * volume;
    audio.loop = loop !== undefined ? loop : sound.loop;

    audio.play();

    return audio;
  }
}
