export {};

declare global {
  interface NotaEntry {
    notas: string[];
    tempoEntreNotas: number;
    duracaoNotas: number;
  }

  interface Music {
    _id: string;
    name: string;
    sequence: NotaEntry[];
  }
}
