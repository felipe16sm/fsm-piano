/* eslint-disable @typescript-eslint/no-explicit-any */
import { PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  InputNumber,
  message,
  Select,
  Space,
  Typography,
} from "antd";
import { useState } from "react";

interface AdicionarNotaAcordeInterface {
  entries: NotaEntry[];
  notaOptions: any;
  setEntries: (nota: NotaEntry[]) => any;
}

const AdicionarNotaAcorde = ({
  notaOptions,
  entries,
  setEntries,
}: AdicionarNotaAcordeInterface) => {

  const [selectedNotas, setSelectedNotas] = useState<string[]>([]);
  const [tempoEntreNotas, setTempoEntreNotas] = useState<number>(200);
  const { Text } = Typography;

  const addEntry = () => {
    if (selectedNotas.length === 0) {
      message.warning("Selecione pelo menos uma nota!");
      return;
    }
    setEntries([
      ...entries,
      {
        notas: [...selectedNotas],
        tempoEntreNotas,
      },
    ]);
    setSelectedNotas([]);
  };

  return (
    <Card title="Adicionar Nota / Acorde" style={{ marginBottom: 24 }}>
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <div>
          <Text strong>Notas:</Text>
          <Select
            mode="multiple"
            style={{ width: "100%", marginTop: 4 }}
            placeholder="Selecione as notas (ex: C4, E4, G4)"
            value={selectedNotas}
            onChange={setSelectedNotas}
            options={notaOptions}
            optionFilterProp="label"
            showSearch
          />
        </div>
        <Space wrap>
          <div>
            <Text strong>Duração da nota (ms):</Text>
            <InputNumber
              min={50}
              max={5000}
              step={50}
              value={tempoEntreNotas}
              onChange={(v) => v && setTempoEntreNotas(v)}
              style={{ display: "block", marginTop: 4 }}
            />
          </div>
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={addEntry}>
          Adicionar
        </Button>
      </Space>
    </Card>
  );
};

export default AdicionarNotaAcorde;
