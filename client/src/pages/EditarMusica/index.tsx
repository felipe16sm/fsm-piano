import { useEffect, useRef, useState } from "react";
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
  EditOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
  HolderOutlined,
} from "@ant-design/icons";
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
import { useGetOneMusic, useUpdateMusic } from "../../hooks";
import tocarMusica from "../../utils/tocarMusica";

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
    </div>
  );
};

const EditarMusica = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const idCounter = useRef(0);
  // eslint-disable-next-line react-hooks/purity
  const makeId = () => `e${++idCounter.current}_${Date.now()}`;
  const withId = (e: NotaEntry): EntryWithId => ({ ...e, __id: makeId() });
  // const stripIds = (arr: EntryWithId[]): NotaEntry[] =>
  //   arr.map(({ __id, ...rest }) => rest);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [entries, setEntries] = useState<EntryWithId[]>([]);

  const [selectedNotas, setSelectedNotas] = useState<string[]>([]);
  const [oitava, setOitava] = useState<number>(4);
  const [oitavaAcorde, setOitavaAcorde] = useState<number>(4);
  const [duracaoNotas, setDuracaoNotas] = useState<number>(1);
  const [tempoEntreNotas, setTempoEntreNotas] = useState<number>(200);

  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editNotas, setEditNotas] = useState<string[]>([]);
  const [editDuracao, setEditDuracao] = useState<number>(1);
  const [editTempo, setEditTempo] = useState<number>(200);

  const MESSAGE_DEFAULT_TIME = 2;

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
      message.error("Música não encontrada", MESSAGE_DEFAULT_TIME);
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
      return message.warning(
        "Selecione pelo menos uma nota!",
        MESSAGE_DEFAULT_TIME,
      );
    const copy = [...entries];
    copy[editIndex] = {
      ...copy[editIndex],
      notas: [...editNotas],
      duracaoNotas: editDuracao,
      tempoEntreNotas: editTempo,
    };
    setEntries(copy);
    setEditIndex(null);
  };

  const addEntry = () => {
    if (selectedNotas.length === 0)
      return message.warning(
        "Selecione pelo menos uma nota!",
        MESSAGE_DEFAULT_TIME,
      );
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

  const removeEntry = (i: number) =>
    setEntries(entries.filter((_, idx) => idx !== i));
  const duplicateEntry = (i: number) => {
    const e = entries[i];
    const copy = [...entries];
    copy.splice(
      i + 1,
      0,
      withId({
        notas: [...e.notas],
        duracaoNotas: e.duracaoNotas,
        tempoEntreNotas: e.tempoEntreNotas,
      }),
    );
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
    if (!name.trim())
      return message.warning("Informe um nome!", MESSAGE_DEFAULT_TIME);

    mutateUpdateMusic({ name: name.trim(), sequence: entries });
  };

  const isSharp = (n: string) => n.includes("#");

  useEffect(() => {
    if (isSuccessUpdateMusic) {
      message.success("Música atualizada!", MESSAGE_DEFAULT_TIME);
      navigate("/musicas");
    }
  }, [isSuccessUpdateMusic, navigate]);

  useEffect(() => {
    if (isErrorUpdateMusic) {
      message.error("Erro ao atualizar.", MESSAGE_DEFAULT_TIME);
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
    <div className="min-h-screen bg-background p-6 responsive-page">
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
            <div style={{ height: 184, overflowY: "auto" }}>
              <Text type="secondary">Nenhuma nota.</Text>
            </div>
          ) : (
            <div style={{ height: 184, overflowY: "auto" }}>
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

        <Card title="Acordes Rápidos" style={{ marginBottom: 24 }}>
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <div>
              <Select
                style={{ width: "100%", marginTop: 4 }}
                value={oitavaAcorde}
                onChange={setOitavaAcorde}
                options={OITAVAS.map((o) => ({
                  label: `Oitava ${o}`,
                  value: o,
                }))}
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
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                flexWrap: "wrap",
              }}
            >
              <div>Adicionar Nota / Acorde</div>
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
                options={OITAVAS.map((o) => ({
                  label: `Oitava ${o}`,
                  value: o,
                }))}
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
          </Space>
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
