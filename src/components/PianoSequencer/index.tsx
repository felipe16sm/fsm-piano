/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import UploadMusicLoadFile from "./UploadMusicLoadFile";
import AdicionarNotaAcorde from "./AdicionarNotaAcorde";
import ListMusic from "./ListMusic";
import Header from "./Header";

const PianoSequencer = () => {
  const [entries, setEntries] = useState<NotaEntry[]>([]);

  const NOTAS = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ];
  const OITAVAS = [1, 2, 3, 4, 5, 6, 7, 8];

  const notaOptions = OITAVAS.flatMap((o) =>
    NOTAS.map((n) => ({ label: `${n}${o}`, value: `${n}${o}` })),
  );

  useEffect(() => {
    console.log(entries);
  }, [entries]);

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <Header />
      <UploadMusicLoadFile setEntries={setEntries} />
      <AdicionarNotaAcorde notaOptions={notaOptions} entries={entries} setEntries={setEntries} />
      <ListMusic notaOptions={notaOptions} entries={entries} setEntries={setEntries} />
    </div>
  );
};

export default PianoSequencer;
