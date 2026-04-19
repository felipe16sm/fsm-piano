// Acordes comuns prontos para adicionar com 1 clique (oitava 4)
export interface ChordPreset {
  label: string;
  notas: string[];
}

// Helper: monta tríade a partir de uma tônica e intervalos em semitons
const NOTES_SHARP = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

function buildTriad(root: string, intervals: number[], baseOctave = 4): string[] {
  const rootIndex = NOTES_SHARP.indexOf(root);
  return intervals.map((interval) => {
    const absolute = rootIndex + interval;
    const noteName = NOTES_SHARP[absolute % 12];
    const octave = baseOctave + Math.floor(absolute / 12);
    return `${noteName}${octave}`;
  });
}

const MAJOR = [0, 4, 7];
const MINOR = [0, 3, 7];

const NATURAL_ROOTS = ["C", "D", "E", "F", "G", "A", "B"];
const SHARP_ROOTS = ["C#", "D#", "F#", "G#", "A#"];

// Maiores naturais
const majorNatural: ChordPreset[] = NATURAL_ROOTS.map((root) => ({
  label: root,
  notas: buildTriad(root, MAJOR),
}));

// Menores naturais
const minorNatural: ChordPreset[] = NATURAL_ROOTS.map((root) => ({
  label: `${root}m`,
  notas: buildTriad(root, MINOR),
}));

// Sustenidos maiores
const majorSharp: ChordPreset[] = SHARP_ROOTS.map((root) => ({
  label: root,
  notas: buildTriad(root, MAJOR),
}));

// Sustenidos menores
const minorSharp: ChordPreset[] = SHARP_ROOTS.map((root) => ({
  label: `${root}m`,
  notas: buildTriad(root, MINOR),
}));

export const COMMON_CHORDS: ChordPreset[] = [
  ...majorNatural,
  ...minorNatural,
  ...majorSharp,
  ...minorSharp,
];

// Agrupados, caso queira renderizar por categoria
export const CHORDS_BY_GROUP = {
  maiores: majorNatural,
  menores: minorNatural,
  maioresSustenidos: majorSharp,
  menoresSustenidos: minorSharp,
};
