/* eslint-disable @typescript-eslint/no-explicit-any */
import { UploadOutlined } from "@ant-design/icons";
import { Button, Card, message, Space, Upload } from "antd";

interface UploadMusicLoadFileInterface {
  setEntries: (nota: NotaEntry[]) => any;
}

const UploadMusicLoadFile = ({ setEntries }: UploadMusicLoadFileInterface) => {
  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (!Array.isArray(parsed)) {
          message.error("O arquivo deve conter um array JSON!");
          return;
        }
        const valid = parsed.every(
          (item: any) =>
            Array.isArray(item.notas) &&
            typeof item.duracaoNota === "number" &&
            typeof item.multiplicadorTempo === "number",
        );
        if (!valid) {
          message.error(
            "Formato inválido. Cada item precisa ter: notas, duracaoNota, multiplicadorTempo.",
          );
          return;
        }
        setEntries(parsed as NotaEntry[]);
        message.success(`${parsed.length} notas carregadas!`);
      } catch {
        message.error("Erro ao ler o arquivo JSON.");
      }
    };
    reader.readAsText(file);
    return false;
  };

  return (
    <Card title="Importar Música" style={{ marginBottom: 24 }}>
      <Space>
        <Upload
          accept=".json"
          showUploadList={false}
          beforeUpload={handleFileUpload}
        >
          <Button icon={<UploadOutlined />}>
            Carregar arquivo JSON da música
          </Button>
        </Upload>
      </Space>
    </Card>
  );
};

export default UploadMusicLoadFile;
