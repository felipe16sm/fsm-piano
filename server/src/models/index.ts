export type MusicNote = {
  notas: string[];
  duracaoNotas: number;
  tempoEntreNotas: number;
};

export type Music = {
  name: string;
  sequence: MusicNote[];
};