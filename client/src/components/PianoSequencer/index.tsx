/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  UnorderedListOutlined,
} from "@ant-design/icons";
import FSMImg from "../../assets/FSMpiano_transparent.png";
import { COMMON_CHORDS } from "../../lib/chords";
import { useMusic } from "../../hooks";
import tocarMusica from "../../utils/tocarMusica";

const { Title, Text } = Typography;

const NOTAS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const OITAVAS = [2, 3, 4, 5, 6, 7];

const notaOptions = OITAVAS.flatMap((o) =>
  NOTAS.map((n) => ({ label: `${n}${o}`, value: `${n}${o}` })),
);

const PianoSequencer = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<NotaEntry[]>([]);
  const [selectedNotas, setSelectedNotas] = useState<string[]>([]);
  const [duracaoNotas, setDuracaoNotas] = useState<number>(1);
  const [tempoEntreNotas, setTempoEntreNotas] = useState<number>(200);

  const [saveOpen, setSaveOpen] = useState(false);
  const [musicName, setMusicName] = useState("");
  const [saving, setSaving] = useState(false);

  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editNotas, setEditNotas] = useState<string[]>([]);
  const [editDuracao, setEditDuracao] = useState<number>(1);
  const [editTempo, setEditTempo] = useState<number>(200);
  const { createMusic } = useMusic({});
  const {
    mutate: mutateCreateMusic,
    isSuccess: isSuccessCreateMusic,
    isError: isErrorCreateMusic,
    isPending: isPendingCreateMusic,
  } = createMusic;

  useEffect(() => {
    const raw = sessionStorage.getItem("selectedMusic");
    if (!raw) return;
    try {
      const data = JSON.parse(raw) as { name: string; sequence: NotaEntry[] };
      if (Array.isArray(data.sequence)) {
        setEntries(data.sequence);
        message.success(`Música "${data.name}" carregada!`);
      }
    } catch {
      // ignore
    } finally {
      sessionStorage.removeItem("selectedMusic");
    }
  }, []);

  const openEdit = (index: number) => {
    const entry = entries[index];
    setEditIndex(index);
    setEditNotas([...entry.notas]);
    setEditDuracao(entry.duracaoNotas);
    setEditTempo(entry.tempoEntreNotas);
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
      duracaoNotas: editDuracao,
      tempoEntreNotas: editTempo,
    };
    setEntries(copy);
    setEditIndex(null);
    message.success("Nota atualizada!");
  };

  const addEntry = () => {
    if (selectedNotas.length === 0) {
      message.warning("Selecione pelo menos uma nota!");
      return;
    }
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
    message.success("Acorde adicionado!");
  };

  const removeEntry = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const duplicateEntry = (index: number) => {
    const entry = entries[index];
    const copy = [...entries];
    copy.splice(index + 1, 0, { ...entry, notas: [...entry.notas] });
    setEntries(copy);
    message.success("Nota duplicada!");
  };

  const moveEntry = (index: number, dir: -1 | 1) => {
    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= entries.length) return;
    const copy = [...entries];
    [copy[index], copy[newIndex]] = [copy[newIndex], copy[index]];
    setEntries(copy);
  };

  const handleSave = async () => {
    if (!musicName.trim()) {
      message.warning("Informe um nome para a música!");
      return;
    }

    mutateCreateMusic({
      name: musicName.trim(),
      sequence: entries,
    });
  };

  const isSharp = (nota: string) => nota.includes("#");

  useEffect(() => {
    if (isPendingCreateMusic) {
      setSaving(true);
    } else {
      setSaving(false);
    }
  }, [isPendingCreateMusic]);

  useEffect(() => {
    if (isSuccessCreateMusic) {
      message.success(`Música "${musicName.trim()}" salva!`);
      setSaveOpen(false);
      setMusicName("");
      setEntries([]);
    }
  }, [isSuccessCreateMusic, musicName]);

  useEffect(() => {
    if (isErrorCreateMusic) {
      message.error("Erro ao salvar música.");
    }
  }, [isErrorCreateMusic]);

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 32,
        }}
      >
        <Title
          level={2}
          style={{
            display: "flex",
            alignItems: "center",
            textAlign: "center",
            marginBottom: 32,
          }}
        >
          <img
            src={FSMImg}
            style={{ backgroundColor: "#e2e9e6ff", borderRadius: 8 }}
            className="base"
            width="100"
            height="80"
            alt=""
          />{" "}
          <div
            style={{
              width: 160,
            }}
          >
            FSM Piano
          </div>
        </Title>
        <Button
          icon={<UnorderedListOutlined />}
          onClick={() => navigate("/musicas")}
        >
          Minhas Músicas
        </Button>
      </div>

      <Card title="Acordes Rápidos" style={{ marginBottom: 24 }}>
        <Space wrap>
          {COMMON_CHORDS.map((c) => (
            <Button key={c.label} onClick={() => addChordPreset(c.notas)}>
              {c.label}
            </Button>
          ))}
        </Space>
        <div style={{ marginTop: 8 }}>
          <Text type="secondary">
            Usa a duração e o tempo entre notas atuais.
          </Text>
        </div>
      </Card>

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
              onClick={() =>
                Modal.confirm({
                  title: "Limpar toda a sequência?",
                  content:
                    "Essa ação não pode ser desfeita. Todas as notas adicionadas serão removidas.",
                  okText: "Sim, limpar",
                  okButtonProps: { danger: true },
                  cancelText: "Cancelar",
                  onOk: () => {
                    setEntries([]);
                    message.success("Sequência limpa");
                  },
                })
              }
              danger
              disabled={entries.length === 0}
            >
              Limpar tudo
            </Button>
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
              onClick={() => setSaveOpen(true)}
              disabled={entries.length === 0}
            >
              Salvar Música
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
                    key="copy"
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() => duplicateEntry(index)}
                    title="Duplicar nota"
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
        title="Salvar Música"
        open={saveOpen}
        onCancel={() => setSaveOpen(false)}
        onOk={handleSave}
        confirmLoading={saving}
        okText="Salvar"
        cancelText="Cancelar"
      >
        <Text strong>Nome da música:</Text>
        <Input
          placeholder="Ex: Escala de Dó"
          value={musicName}
          onChange={(e) => setMusicName(e.target.value)}
          onPressEnter={handleSave}
          style={{ marginTop: 8 }}
          autoFocus
        />
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
  );
};

export default PianoSequencer;
