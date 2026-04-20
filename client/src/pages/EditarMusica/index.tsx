import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  Button,
  InputNumber,
  Select,
  Tag,
  Space,
  Typography,
  List,
  Modal,
  Input,
  Spin,
  message,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  CopyOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  EditOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { COMMON_CHORDS } from "../../lib/chords";
import { useGetOneMusic, useUpdateMusic } from "../../hooks";
import tocarMusica from "../../utils/tocarMusica";

const { Title, Text } = Typography;

const NOTAS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const OITAVAS = [2, 3, 4, 5, 6, 7];
const notaOptions = OITAVAS.flatMap((o) =>
  NOTAS.map((n) => ({ label: `${n}${o}`, value: `${n}${o}` })),
);

const EditarMusica = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [entries, setEntries] = useState<NotaEntry[]>([]);

  const [selectedNotas, setSelectedNotas] = useState<string[]>([]);
  const [duracaoNotas, setDuracaoNotas] = useState<number>(1);
  const [tempoEntreNotas, setTempoEntreNotas] = useState<number>(200);

  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editNotas, setEditNotas] = useState<string[]>([]);
  const [editDuracao, setEditDuracao] = useState<number>(1);
  const [editTempo, setEditTempo] = useState<number>(200);
  
  const {
    data: getOneMusicData,
    isSuccess: isSuccessGetOneMusic,
    isPending: isPendingGetOneMusic,
    isError: isErrorGetOneMusic,
  } = useGetOneMusic({ id });

  const {
    mutate: mutateUpdateMusic,
    isSuccess: isSuccessUpdateMusic,
    isPending: isPendingUpdateMusic,
    isError: isErrorUpdateMusic,
  } = useUpdateMusic({ id });

  useEffect(() => {
    (() => {
      if (isSuccessGetOneMusic && getOneMusicData) {
        setName(getOneMusicData.name);
        setEntries(getOneMusicData.sequence);
        setLoading(false);
      }
    })();
  }, [getOneMusicData, isSuccessGetOneMusic]);

  useEffect(() => {
    if (isErrorGetOneMusic) {
      message.error("Música não encontrada");
      navigate("/musicas");
    }
  }, [isErrorGetOneMusic, navigate]);

  useEffect(() => {
    (() => {
      if (isPendingGetOneMusic) {
        setLoading(true);
      }
    })();
  }, [isPendingGetOneMusic]);

  const openEdit = (index: number) => {
    const e = entries[index];
    setEditIndex(index);
    setEditNotas([...e.notas]);
    setEditDuracao(e.duracaoNotas);
    setEditTempo(e.tempoEntreNotas);
  };

  const saveEdit = () => {
    if (editIndex === null) return;
    if (editNotas.length === 0)
      return message.warning("Selecione pelo menos uma nota!");
    const copy = [...entries];
    copy[editIndex] = {
      notas: [...editNotas],
      duracaoNotas: editDuracao,
      tempoEntreNotas: editTempo,
    };
    setEntries(copy);
    setEditIndex(null);
  };

  const addEntry = () => {
    if (selectedNotas.length === 0)
      return message.warning("Selecione pelo menos uma nota!");
    setEntries([
      ...entries,
      { notas: [...selectedNotas], duracaoNotas, tempoEntreNotas },
    ]);
    setSelectedNotas([]);
  };

  const addChordPreset = (notas: string[]) => {
    setEntries([
      ...entries,
      { notas: [...notas], duracaoNotas, tempoEntreNotas },
    ]);
  };

  const removeEntry = (i: number) =>
    setEntries(entries.filter((_, idx) => idx !== i));
  const duplicateEntry = (i: number) => {
    const copy = [...entries];
    copy.splice(i + 1, 0, { ...entries[i], notas: [...entries[i].notas] });
    setEntries(copy);
  };
  const moveEntry = (i: number, dir: -1 | 1) => {
    const ni = i + dir;
    if (ni < 0 || ni >= entries.length) return;
    const copy = [...entries];
    [copy[i], copy[ni]] = [copy[ni], copy[i]];
    setEntries(copy);
  };

  const handleSave = async () => {
    if (!id) return;
    if (!name.trim()) return message.warning("Informe um nome!");

    mutateUpdateMusic({ name: name.trim(), sequence: entries });
  };

  const isSharp = (n: string) => n.includes("#");

  useEffect(() => {
    if (isSuccessUpdateMusic) {
      message.success("Música atualizada!");
      navigate("/musicas");
    }
  }, [isSuccessUpdateMusic, navigate]);

  useEffect(() => {
    if (isErrorUpdateMusic) {
      message.error("Erro ao atualizar.");
    }
  }, [isErrorUpdateMusic]);

  useEffect(() => {
    (() => {
      if (isPendingUpdateMusic) {
        setSaving(true);
      } else {
        setSaving(false);
      }
    })();
  }, [isPendingUpdateMusic]);

  if (loading) {
    return (
      <div
        className="min-h-screen bg-background p-6"
        style={{ textAlign: "center" }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <Space style={{ marginBottom: 24 }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/musicas")}
          >
            Voltar
          </Button>
          <Title level={2} style={{ margin: 0 }}>
            ✏️ Editar Música
          </Title>
        </Space>

        <Card title="Nome" style={{ marginBottom: 24 }}>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </Card>

        <Card title="Acordes Rápidos" style={{ marginBottom: 24 }}>
          <Space wrap>
            {COMMON_CHORDS.map((c) => (
              <Button key={c.label} onClick={() => addChordPreset(c.notas)}>
                {c.label}
              </Button>
            ))}
          </Space>
        </Card>

        <Card title="Adicionar Nota / Acorde" style={{ marginBottom: 24 }}>
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <Select
              mode="multiple"
              style={{ width: "100%" }}
              placeholder="Selecione notas"
              value={selectedNotas}
              onChange={setSelectedNotas}
              options={notaOptions}
              optionFilterProp="label"
              showSearch
            />
            <Space wrap>
              <div>
                <Text strong>Duração da nota:</Text>
                <InputNumber
                  min={0.1}
                  max={16}
                  step={0.1}
                  value={duracaoNotas}
                  onChange={(v) => v && setDuracaoNotas(v)}
                  style={{ display: "block", marginTop: 4 }}
                />
              </div>
              <div>
                <Text strong>Tempo entre notas (ms):</Text>
                <InputNumber
                  min={0}
                  max={5000}
                  step={50}
                  value={tempoEntreNotas}
                  onChange={(v) =>
                    v !== null && v !== undefined && setTempoEntreNotas(v)
                  }
                  style={{ display: "block", marginTop: 4 }}
                />
              </div>
            </Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={addEntry}>
              Adicionar
            </Button>
          </Space>
        </Card>

        <Card
          title={`Sequência (${entries.length} itens)`}
          extra={
            <Space>
              <Button
                disabled={entries.length === 0}
                onClick={() => {
                  tocarMusica(entries);
                }}
              >
                ▶ Tocar Música
              </Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSave}
                loading={saving}
              >
                Salvar Alterações
              </Button>
            </Space>
          }
        >
          {entries.length === 0 ? (
            <Text type="secondary">Nenhuma nota.</Text>
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
                      key="copy"
                      size="small"
                      icon={<CopyOutlined />}
                      onClick={() => duplicateEntry(index)}
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
                    <Tag color="green">dur: {entry.duracaoNotas}</Tag>
                    <Tag color="gold">{entry.tempoEntreNotas}ms</Tag>
                  </Space>
                </List.Item>
              )}
            />
          )}
        </Card>

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
            <Select
              mode="multiple"
              style={{ width: "100%" }}
              value={editNotas}
              onChange={setEditNotas}
              options={notaOptions}
              optionFilterProp="label"
              showSearch
            />
            <Space wrap>
              <div>
                <Text strong>Duração da nota:</Text>
                <InputNumber
                  min={0.1}
                  max={16}
                  step={0.1}
                  value={editDuracao}
                  onChange={(v) => v && setEditDuracao(v)}
                  style={{ display: "block", marginTop: 4 }}
                />
              </div>
              <div>
                <Text strong>Tempo entre notas (ms):</Text>
                <InputNumber
                  min={0}
                  max={5000}
                  step={50}
                  value={editTempo}
                  onChange={(v) =>
                    v !== null && v !== undefined && setEditTempo(v)
                  }
                  style={{ display: "block", marginTop: 4 }}
                />
              </div>
            </Space>
          </Space>
        </Modal>
      </div>
    </div>
  );
};

export default EditarMusica;
