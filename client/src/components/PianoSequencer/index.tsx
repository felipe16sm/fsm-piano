import { useEffect, useRef, useState } from "react";
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
  EditOutlined,
  SaveOutlined,
  UnorderedListOutlined,
  HolderOutlined,
} from "@ant-design/icons";
import FSMImg from "../../assets/FSMpiano_transparent.png";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { COMMON_CHORDS } from "../../lib/chords";
import { useCreateMusic } from "../../hooks";
import ButtonTocarMusica from "../ButtonTocarMusica";

const { Title, Text } = Typography;

const NOTAS_NATURAIS = ["C", "D", "E", "F", "G", "A", "B"];
const NOTAS_SUSTENIDOS = ["C#", "D#", "F#", "G#", "A#"];
const OITAVAS = [1, 2, 3, 4, 5, 6, 7, 8];

const NOTAS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const notaOptions = OITAVAS.flatMap((o) =>
  NOTAS.map((n) => ({ label: `${n}${o}`, value: `${n}${o}` })),
);

type EntryWithId = NotaEntry & { __id: string };

interface SortableRowProps {
  id: string;
  entry: EntryWithId;
  index: number;
  total: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onEdit: () => void;
  onRemove: () => void;
  isSharp: (n: string) => boolean;
}

const SortableRow = ({
  id,
  entry,
  index,
  onDuplicate,
  onEdit,
  onRemove,
  isSharp,
}: SortableRowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    background: isDragging ? "hsl(var(--muted))" : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <List.Item
        actions={[
          <Button
            key="copy"
            size="small"
            icon={<CopyOutlined />}
            onClick={onDuplicate}
            title="Duplicar nota"
          />,
          <Button
            key="edit"
            size="small"
            icon={<EditOutlined />}
            onClick={onEdit}
          />,
          <Button
            key="del"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={onRemove}
          />,
        ]}
      >
        <Space wrap>
          <Button
            type="text"
            size="small"
            icon={<HolderOutlined />}
            style={{ cursor: "grab", touchAction: "none" }}
            {...attributes}
            {...listeners}
            title="Arrastar para reordenar"
          />
          <Typography.Text strong style={{ minWidth: 30 }}>
            #{index + 1}
          </Typography.Text>
          {entry.notas.map((n) => (
            <Tag key={n} color={isSharp(n) ? "volcano" : "blue"}>
              {n}
            </Tag>
          ))}
          <Tag color="green">dur: {entry.duracaoNotas}</Tag>
          <Tag color="gold">{entry.tempoEntreNotas}ms</Tag>
        </Space>
      </List.Item>
    </div>
  );
};

const PianoSequencer = () => {
  const navigate = useNavigate();
  const idCounter = useRef(0);
  const makeId = () => `e${++idCounter.current}_${Date.now()}`;
  const withId = (e: NotaEntry): EntryWithId => ({ ...e, __id: makeId() });
  // const stripIds = (arr: EntryWithId[]): NotaEntry[] =>
  //   arr.map(({ __id, ...rest }) => rest);

  const [entries, setEntries] = useState<EntryWithId[]>([]);
  const [selectedNotas, setSelectedNotas] = useState<string[]>([]);
  const [oitava, setOitava] = useState<number>(4);
  const [oitavaAcorde, setOitavaAcorde] = useState<number>(4);
  const [duracaoNotas, setDuracaoNotas] = useState<number>(1);
  const [tempoEntreNotas, setTempoEntreNotas] = useState<number>(200);

  const [saveOpen, setSaveOpen] = useState(false);
  const [sequenceOpen, setSequenceOpen] = useState(false);
  const [musicName, setMusicName] = useState("");
  const [saving, setSaving] = useState(false);

  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editNotas, setEditNotas] = useState<string[]>([]);
  const [editDuracao, setEditDuracao] = useState<number>(1);
  const [editTempo, setEditTempo] = useState<number>(200);
  const {
    mutate: mutateCreateMusic,
    isSuccess: isSuccessCreateMusic,
    isError: isErrorCreateMusic,
    isPending: isPendingCreateMusic,
  } = useCreateMusic();

  const MESSAGE_DEFAULT_TIME = 2;

  useEffect(() => {
    const raw = sessionStorage.getItem("selectedMusic");
    if (!raw) return;
    try {
      const data = JSON.parse(raw) as { name: string; sequence: NotaEntry[] };
      if (Array.isArray(data.sequence)) {
        setEntries(data.sequence.map(withId));
        message.success(
          `Música "${data.name}" carregada!`,
          MESSAGE_DEFAULT_TIME,
        );
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
      message.warning("Selecione pelo menos uma nota!", MESSAGE_DEFAULT_TIME);
      return;
    }
    const copy = [...entries];
    copy[editIndex] = {
      ...copy[editIndex],
      notas: [...editNotas],
      duracaoNotas: editDuracao,
      tempoEntreNotas: editTempo,
    };
    setEntries(copy);
    setEditIndex(null);
    message.success("Nota atualizada!", MESSAGE_DEFAULT_TIME);
  };

  const addEntry = () => {
    if (selectedNotas.length === 0) {
      message.warning("Selecione pelo menos uma nota!", MESSAGE_DEFAULT_TIME);
      return;
    }

    setEntries([
      ...entries,
      withId({ notas: [...selectedNotas], duracaoNotas, tempoEntreNotas }),
    ]);

    message.success("Nota ou acorde adicionado!", MESSAGE_DEFAULT_TIME);

    setSelectedNotas([]);
  };

  const toggleNota = (nota: string) => {
    const full = `${nota}${oitava}`;
    setSelectedNotas((prev) =>
      prev.includes(full) ? prev.filter((n) => n !== full) : [...prev, full],
    );
  };

  const isNotaSelected = (nota: string) =>
    selectedNotas.includes(`${nota}${oitava}`);

  const addChordPreset = (notas: string[]) => {
    // Transpõe as notas (montadas com baseOctave=4 em chords.ts) para a oitava escolhida
    const delta = oitavaAcorde - 4;
    const transposed = notas.map((n) => {
      const match = n.match(/^([A-G]#?)(\d+)$/);
      if (!match) return n;
      const [, name, oct] = match;
      return `${name}${parseInt(oct, 10) + delta}`;
    });
    setEntries([
      ...entries,
      withId({ notas: transposed, duracaoNotas, tempoEntreNotas }),
    ]);
    message.success("Acorde adicionado!", MESSAGE_DEFAULT_TIME);
  };

  const removeEntry = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const duplicateEntry = (index: number) => {
    const entry = entries[index];
    const copy = [...entries];
    copy.splice(
      index + 1,
      0,
      withId({
        notas: [...entry.notas],
        duracaoNotas: entry.duracaoNotas,
        tempoEntreNotas: entry.tempoEntreNotas,
      }),
    );
    setEntries(copy);
    message.success("Nota duplicada!", MESSAGE_DEFAULT_TIME);
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
      message.warning("Informe um nome para a música!", MESSAGE_DEFAULT_TIME);
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
      setSaveOpen(false);
      setSequenceOpen(false);
    }
  }, [isSuccessCreateMusic]);

  useEffect(() => {
    if (isSuccessCreateMusic && !saveOpen && musicName) {
      message.success(
        `Música "${musicName.trim()}" salva!`,
        MESSAGE_DEFAULT_TIME,
      );
      setMusicName("");
    }
  }, [isSuccessCreateMusic, musicName, saveOpen]);

  useEffect(() => {
    if (isErrorCreateMusic) {
      message.error("Erro ao salvar música.", MESSAGE_DEFAULT_TIME);
    }
  }, [isErrorCreateMusic]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = entries.findIndex((e) => e.__id === active.id);
    const newIndex = entries.findIndex((e) => e.__id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    setEntries(arrayMove(entries, oldIndex, newIndex));
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <div
        className="responsive-page-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <img
            src={FSMImg}
            style={{ backgroundColor: "#ecf5efff", borderRadius: 8 }}
            className="base"
            width="64"
            height="48"
            alt=""
          />{" "}
          <Title
            style={{
              marginLeft: 8,
              fontSize: 18,
            }}
          >
            FSM Piano
          </Title>
        </div>
        <Button
          icon={<UnorderedListOutlined />}
          onClick={() => navigate("/musicas")}
        >
          Minhas Músicas
        </Button>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap" }}>
        <Button
          style={{ width: 148, marginRight: 16, marginTop: 8 }}
          type="primary"
          onClick={() => setSequenceOpen(true)}
        >
          Ver notas
        </Button>
        <Button
          style={{ width: 148, marginRight: 16, marginTop: 8 }}
          onClick={() =>
            Modal.confirm({
              title: "Limpar toda a sequência?",
              zIndex: 2,
              content:
                "Essa ação não pode ser desfeita. Todas as notas adicionadas serão removidas.",
              okText: "Sim, limpar",
              okButtonProps: { danger: true },
              cancelText: "Cancelar",
              onOk: () => {
                setEntries([]);
                message.success("Sequência limpa", MESSAGE_DEFAULT_TIME);
              },
            })
          }
          danger
          disabled={entries.length === 0}
        >
          Limpar tudo
        </Button>
        <ButtonTocarMusica
          style={{ width: 148, marginRight: 16, marginTop: 8 }}
          entries={entries}
        />
        <Button
          style={{ width: 148, marginTop: 8 }}
          type="primary"
          icon={<SaveOutlined />}
          onClick={() => setSaveOpen(true)}
          disabled={entries.length === 0}
        >
          Salvar Música
        </Button>
      </div>
      <Modal
        style={{ maxWidth: 640 }}
        zIndex={1}
        width={"90%"}
        title={`Sequência (${entries.length} itens)`}
        open={sequenceOpen}
        onCancel={() => setSequenceOpen(false)}
        footer={null}
      >
        <Card
          title={
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                flexWrap: "wrap",
                padding: 8,
              }}
            >
              <ButtonTocarMusica
                style={{ width: "100%", marginBottom: 8 }}
                entries={entries}
              />
              <Button
                style={{ width: "100%" }}
                type="primary"
                icon={<SaveOutlined />}
                onClick={() => setSaveOpen(true)}
                disabled={entries.length === 0}
              >
                Salvar Música
              </Button>
              <Button
                style={{ width: "100%", marginTop: 8 }}
                onClick={() =>
                  Modal.confirm({
                    title: "Limpar toda a sequência?",
                    zIndex: 2,
                    content:
                      "Essa ação não pode ser desfeita. Todas as notas adicionadas serão removidas.",
                    okText: "Sim, limpar",
                    okButtonProps: { danger: true },
                    cancelText: "Cancelar",
                    onOk: () => {
                      setEntries([]);
                      message.success("Sequência limpa", MESSAGE_DEFAULT_TIME);
                    },
                  })
                }
                danger
                disabled={entries.length === 0}
              >
                Limpar tudo
              </Button>
            </div>
          }
        >
          {entries.length === 0 ? (
            <div style={{ height: 360, overflowY: "auto" }}>
              <Text type="secondary">Nenhuma nota adicionada ainda.</Text>
            </div>
          ) : (
            <div style={{ height: 360, overflowY: "auto" }}>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={entries.map((e) => e.__id)}
                  strategy={verticalListSortingStrategy}
                >
                  <List
                    dataSource={entries}
                    rowKey={(item) => item.__id}
                    renderItem={(entry, index) => (
                      <SortableRow
                        id={entry.__id}
                        entry={entry}
                        index={index}
                        total={entries.length}
                        onMoveUp={() => moveEntry(index, -1)}
                        onMoveDown={() => moveEntry(index, 1)}
                        onDuplicate={() => duplicateEntry(index)}
                        onEdit={() => openEdit(index)}
                        onRemove={() => removeEntry(index)}
                        isSharp={isSharp}
                      />
                    )}
                  />
                </SortableContext>
              </DndContext>
            </div>
          )}
        </Card>
      </Modal>

      <Card title="Acordes Rápidos" style={{ marginTop: 24, marginBottom: 24 }}>
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <div>
            <Select
              style={{ width: "100%", marginTop: 4 }}
              value={oitavaAcorde}
              onChange={setOitavaAcorde}
              options={OITAVAS.map((o) => ({ label: `Oitava ${o}`, value: o }))}
            />
          </div>
          <Space wrap>
            {COMMON_CHORDS.map((c) => (
              <Button key={c.label} onClick={() => addChordPreset(c.notas)}>
                {c.label}
              </Button>
            ))}
          </Space>
          <Text type="secondary">
            Usa a duração e o tempo entre notas atuais.
          </Text>
        </Space>
      </Card>

      <Card
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ width: "50%", marginRight: 8 }}>
              Adicionar Nota / Acorde
            </div>
            <Button
              style={{ width: "50%" }}
              type="primary"
              icon={<PlusOutlined />}
              onClick={addEntry}
            >
              Adicionar
            </Button>
          </div>
        }
        style={{ marginBottom: 24 }}
      >
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <div>
            <Select
              style={{ width: "100%", marginTop: 4 }}
              value={oitava}
              onChange={setOitava}
              options={OITAVAS.map((o) => ({ label: `Oitava ${o}`, value: o }))}
            />
          </div>

          <div>
            <div style={{ marginTop: 8 }}>
              <Space wrap>
                {NOTAS_NATURAIS.map((n) => (
                  <Button
                    key={n}
                    type={isNotaSelected(n) ? "primary" : "default"}
                    onClick={() => toggleNota(n)}
                  >
                    {n}
                    {oitava}
                  </Button>
                ))}
              </Space>
            </div>
          </div>

          <div>
            <div style={{ marginTop: 4 }}>
              <Space wrap>
                {NOTAS_SUSTENIDOS.map((n) => (
                  <Button
                    key={n}
                    type={isNotaSelected(n) ? "primary" : "default"}
                    danger={isNotaSelected(n)}
                    onClick={() => toggleNota(n)}
                  >
                    {n}
                    {oitava}
                  </Button>
                ))}
              </Space>
            </div>
          </div>

          {selectedNotas.length > 0 && (
            <div>
              <div style={{ marginTop: 8 }}>
                <Space wrap>
                  {selectedNotas.map((n) => (
                    <Tag
                      key={n}
                      color={n.includes("#") ? "volcano" : "blue"}
                      closable
                      onClose={() =>
                        setSelectedNotas(selectedNotas.filter((x) => x !== n))
                      }
                    >
                      {n}
                    </Tag>
                  ))}
                  <Button size="small" onClick={() => setSelectedNotas([])}>
                    Limpar
                  </Button>
                </Space>
              </div>
            </div>
          )}

          <Space wrap>
            <div style={{ width: 160 }}>
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
            <div style={{ width: 160 }}>
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
        </Space>
      </Card>

      <Modal
        title="Salvar Música"
        zIndex={2}
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
        zIndex={2}
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
