/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CopyOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  InputNumber,
  List,
  message,
  Modal,
  Select,
  Space,
  Tag,
  Typography,
} from "antd";
import { useState } from "react";
import tocarMusica from "../../../utils/tocarMusica";

interface ListMusicInterface {
  notaOptions: any;
  entries: NotaEntry[];
  setEntries: (nota: NotaEntry[]) => any;
}

const ListMusic = ({
  notaOptions,
  entries,
  setEntries,
}: ListMusicInterface) => {
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editNotas, setEditNotas] = useState<string[]>([]);
  const [editTempoEntreNotas, setEditTempoEntreNotas] = useState<number>(200);
  const [jsonVisible, setJsonVisible] = useState(false);

  const { Text } = Typography;

  const removeEntry = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const moveEntry = (index: number, dir: -1 | 1) => {
    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= entries.length) return;
    const copy = [...entries];
    [copy[index], copy[newIndex]] = [copy[newIndex], copy[index]];
    setEntries(copy);
  };

  const exportJson = () => {
    setJsonVisible(true);
  };

  const copyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(entries, null, 2));
    message.success("JSON copiado!");
  };

  const openEdit = (index: number) => {
    const entry = entries[index];
    setEditIndex(index);
    setEditNotas([...entry.notas]);
    setEditTempoEntreNotas(entry.tempoEntreNotas);
  };

  const saveEdit = () => {
    if (editIndex === null) return;
    if (editNotas.length === 0) {
      message.warning("Selecione pelo menos uma nota!");
      return;
    }
    const copy = [...entries];
    copy[editIndex] = {
      notas: [...editNotas],
      tempoEntreNotas: editTempoEntreNotas,
    };
    setEntries(copy);
    setEditIndex(null);
    message.success("Nota atualizada!");
  };

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(entries, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "musica.json";
    a.click();
    URL.revokeObjectURL(url);
    message.success("Arquivo baixado!");
  };

  const isSharp = (nota: string) => nota.includes("#");

  return (
    <>
      <Card
        title={`Sequência (${entries.length} itens)`}
        extra={
          <Space>
            <Button
              onClick={() => setEntries([])}
              danger
              disabled={entries.length === 0}
            >
              Limpar tudo
            </Button>
            <Button
              disabled={entries.length === 0}
              onClick={() => tocarMusica(entries)}
            >
              ▶ Tocar Música
            </Button>
            <Button
              type="primary"
              onClick={exportJson}
              disabled={entries.length === 0}
            >
              Gerar JSON da Música
            </Button>
          </Space>
        }
      >
        {entries.length === 0 ? (
          <Text type="secondary">Nenhuma nota adicionada ainda.</Text>
        ) : (
          <List
            dataSource={entries}
            renderItem={(entry, index) => (
              <List.Item
                actions={[
                  <Button
                    key="up"
                    size="small"
                    icon={<ArrowUpOutlined />}
                    disabled={index === 0}
                    onClick={() => moveEntry(index, -1)}
                  />,
                  <Button
                    key="down"
                    size="small"
                    icon={<ArrowDownOutlined />}
                    disabled={index === entries.length - 1}
                    onClick={() => moveEntry(index, 1)}
                  />,
                  <Button
                    key="edit"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => openEdit(index)}
                  />,
                  <Button
                    key="del"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeEntry(index)}
                  />,
                ]}
              >
                <Space wrap>
                  <Text strong style={{ minWidth: 30 }}>
                    #{index + 1}
                  </Text>
                  {entry.notas.map((n) => (
                    <Tag key={n} color={isSharp(n) ? "volcano" : "blue"}>
                      {n}
                    </Tag>
                  ))}
                  <Tag color="green">{entry.tempoEntreNotas}ms</Tag>
                </Space>
              </List.Item>
            )}
          />
        )}
      </Card>
      <Modal
        title="JSON da Música"
        open={jsonVisible}
        onCancel={() => setJsonVisible(false)}
        footer={[
          <Button
            key="download"
            type="primary"
            icon={<DownloadOutlined />}
            onClick={downloadJson}
          >
            Baixar JSON
          </Button>,
          <Button key="copy" icon={<CopyOutlined />} onClick={copyJson}>
            Copiar
          </Button>,
          <Button key="close" onClick={() => setJsonVisible(false)}>
            Fechar
          </Button>,
        ]}
        width={600}
      >
        <pre
          style={{
            background: "#f5f5f5",
            padding: 16,
            borderRadius: 8,
            maxHeight: 400,
            overflow: "auto",
            fontSize: 13,
          }}
        >
          {JSON.stringify(entries, null, 2)}
        </pre>
      </Modal>

      <Modal
        title="Editar Nota"
        open={editIndex !== null}
        onCancel={() => setEditIndex(null)}
        onOk={saveEdit}
        okText="Salvar"
        cancelText="Cancelar"
        width={500}
      >
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <div>
            <Text strong>Notas:</Text>
            <Select
              mode="multiple"
              style={{ width: "100%", marginTop: 4 }}
              placeholder="Selecione as notas"
              value={editNotas}
              onChange={setEditNotas}
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
                value={editTempoEntreNotas}
                onChange={(v) => v && setEditTempoEntreNotas(v)}
                style={{ display: "block", marginTop: 4 }}
              />
            </div>
          </Space>
        </Space>
      </Modal>
    </>
  );
};

export default ListMusic;
