import sleep from "../sleep";
import tocarNotas from "../tocarNotas";

const tocarMusica = async (entries: NotaEntry[]) => {
  for (let i = 0; i < entries.length; i++) {
    const { notas, tempoEntreNotas, duracaoNotas } = entries[i];

    tocarNotas(notas, duracaoNotas);
    await sleep(tempoEntreNotas);
  }
};

export default tocarMusica;
