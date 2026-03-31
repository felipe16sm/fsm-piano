import FSMImg from "./assets/FSMpiano_transparent.png";
import tocarNotas from "./utils/tocarNotas";
import sleep from "./utils/sleep";
import { Piano } from "./components";
import { useState } from "react";
import { Button, Input, Typography, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import musicaExemplo from "./mocks/musicaExemplo";

function App() {
  const [data, setData] = useState<any>(null);
  const [tempoPadrao, setTempoPadrao] = useState<number>(200);
  const [duracaoNotaPadrao, setDuracaoNotaPadrao] = useState<number>(1);

  interface NotasDataInterface {
    notas: string[];
    multiplicadorTempo?: number;
    duracaoNota?: number;
  }

  const TocarMusica = async (
    notasData: NotasDataInterface[],
    tempoPadraoNotas: number,
  ) => {
    for (let i = 0; i < notasData.length; i++) {
      const { notas, multiplicadorTempo = 1, duracaoNota } = notasData[i];
      console.log(duracaoNota)

      tocarNotas(notas, duracaoNota || duracaoNotaPadrao);
      await sleep(multiplicadorTempo * tempoPadraoNotas);
    }
  };

  const handleFile = async (file: any) => {
    console.log(file);
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      setData(json);

      console.log("JSON lido:", json);
    } catch (err) {
      console.error("Erro ao ler JSON:", err);
    }

    return false;
  };

  const downloadExample = () => {
    const blob = new Blob([JSON.stringify(musicaExemplo, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "musica_exemplo.json";
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        display: "block",
        flexDirection: "column",
        maxWidth: "100vw",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          marginTop: 20,
        }}
      >
        <img
          src={FSMImg}
          style={{ backgroundColor: "#00703c", borderRadius: 8 }}
          className="base"
          width="200"
          height="160"
          alt=""
        />

        <div>
          <h1>FSM Piano</h1>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Button
          type="primary"
          disabled={!data}
          style={{ marginBottom: 20 }}
          onClick={async () => {
            TocarMusica(data, tempoPadrao);
          }}
        >
          Tocar Música
        </Button>
        <Upload beforeUpload={handleFile} maxCount={1} showUploadList={false}>
          <Button icon={<UploadOutlined />}>Fazer Upload da música</Button>
        </Upload>
        <Typography
          style={{
            color: "#ffffffff",
            marginTop: 20,
            marginBottom: 8,
            fontSize: 18,
            fontWeight: "bold",
          }}
        >
          Tempo entre as notas
        </Typography>
        <Input
          placeholder="Tempo entre as notas"
          value={tempoPadrao}
          style={{ width: 200, marginBottom: 8 }}
          onChange={(e: any) => {
            setTempoPadrao(Number(e.target.value));
          }}
        />
        <Typography
          style={{
            color: "#ffffffff",
            marginTop: 8,
            marginBottom: 8,
            fontSize: 18,
            fontWeight: "bold",
          }}
        >
          Duração das notas
        </Typography>
        <Input
          placeholder="Duração das notas"
          defaultValue={duracaoNotaPadrao}
          style={{ width: 200, marginBottom: 20 }}
          onChange={(e: any) => {
            setDuracaoNotaPadrao(Number(e.target.value));
          }}
        />
        <Button
          type="default"
          style={{
            width: 200,
            marginBottom: 16,
            backgroundColor: "bisque",
          }}
          onClick={downloadExample}
        >
          Baixar JSON de exemplo
        </Button>
      </div>
      <Piano />
    </div>
  );
}

export default App;
