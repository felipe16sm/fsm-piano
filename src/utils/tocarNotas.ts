/* eslint-disable @typescript-eslint/no-explicit-any */
import * as Tone from "tone";

const sampler = new Tone.Sampler({
  urls: {
    C4: "C4.mp3",
    "D#4": "Ds4.mp3",
    "F#4": "Fs4.mp3",
    A4: "A4.mp3",
  },
  release: 1,
  baseUrl: "https://tonejs.github.io/audio/salamander/",
}).toDestination();

const tocarNotas = (notas: any, tempo: any = 1) => {
  Tone.loaded().then(() => {
    sampler.triggerAttackRelease(notas, tempo);
  });
};

export default tocarNotas;
