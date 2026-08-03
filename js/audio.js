import { HAND_NOTES } from "./notes.js";

const TONE_MODULE_URL = "https://cdn.jsdelivr.net/npm/tone@15.5.27/+esm";
const PIANO_SAMPLE_URL = "https://tonejs.github.io/audio/salamander/";

export class MusicPlayer {
  constructor() {
    this.ready = false;
    this.tone = null;
    this.piano = null;
  }

  async initialize() {
    if (!this.tone) this.tone = await import(TONE_MODULE_URL);
    await this.tone.start();
    if (this.ready) return;

    // De vrais échantillons de piano, transposés par Tone.js pour les notes voisines.
    this.piano = new this.tone.Sampler({
      urls: { C3: "C3.mp3", C4: "C4.mp3" },
      baseUrl: PIANO_SAMPLE_URL,
      release: 1.2,
      volume: -10
    }).toDestination();
    await this.tone.loaded();
    this.ready = true;
  }

  setNote(hand, finger, shouldPlay) {
    if (!this.ready) return;
    const note = HAND_NOTES[hand][finger];
    if (shouldPlay) this.piano.triggerAttack(note);
    else this.piano.triggerRelease(note);
  }

  stopAll() {
    this.piano?.releaseAll();
  }
}
