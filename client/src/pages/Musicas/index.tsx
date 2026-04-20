/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  List,
  Typography,
  Space,
  Tag,
  Empty,
  Spin,
  message,
  Popconfirm,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { useGetMusics, useDeleteMusic } from "../../hooks";

const { Title, Text } = Typography;

const Musicas = () => {
  const navigate = useNavigate();
  const [musics, setMusics] = useState<Music[]>([]);
  const [loading, setLoading] = useState(false);
  const {
    data: getMusicsData,
    isSuccess: isSuccessGetMusics,
    isError: isErrorGetMusics,
    isPending: isPendingGetMusics,
    refetch: refetchGetMusics,
  } = useGetMusics();

  const { mutate: mutateDeleteMusic, isSuccess: isSuccessDeleteMusic } =
    useDeleteMusic();

  const handleDelete = async (id: string) => {
    mutateDeleteMusic({ id });
    refetchGetMusics();
  };

  const handleSelect = (m: Music) => {
    sessionStorage.setItem(
      "selectedMusic",
      JSON.stringify({ name: m.name, sequence: m.sequence }),
    );
    message.success(`"${m.name}" carregada no sequenciador!`);
    navigate("/");
  };

  useEffect(() => {
    console.log(isSuccessGetMusics)
    console.log(getMusicsData)
    if (isSuccessGetMusics && getMusicsData) {
      setMusics(() => getMusicsData);
    }
  }, [getMusicsData, isSuccessGetMusics]);

  useEffect(() => {
    if (isPendingGetMusics) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [isPendingGetMusics]);

  useEffect(() => {
    if (isErrorGetMusics) {
      message.error("Erro ao carregar músicas.");
    }
  }, [isErrorGetMusics]);

  useEffect(() => {
    if (isSuccessDeleteMusic) {
      message.success("Música removida!");
      refetchGetMusics();
    }
  }, [isSuccessDeleteMusic, refetchGetMusics]);

  return (
    <div className="min-h-screen bg-background p-6">
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/")}>
              Voltar
            </Button>
            <Title level={2} style={{ margin: 0 }}>
              🎵 Minhas Músicas
            </Title>
          </Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => refetchGetMusics()}
            loading={loading}
          >
            Atualizar
          </Button>
        </div>

        <Card>
          {loading ? (
            <div style={{ textAlign: "center", padding: 40 }}>
              <Spin />
            </div>
          ) : musics.length === 0 ? (
            <Empty description="Nenhuma música salva ainda" />
          ) : (
            <List
              dataSource={musics}
              renderItem={(m) => (
                <List.Item
                  actions={[
                    <Button
                      key="select"
                      type="primary"
                      icon={<PlayCircleOutlined />}
                      onClick={() => handleSelect(m)}
                    >
                      Selecionar
                    </Button>,
                    <Button
                      key="edit"
                      icon={<EditOutlined />}
                      onClick={() => navigate(`/musicas/${m._id}`)}
                    >
                      Editar
                    </Button>,
                    <Popconfirm
                      key="del"
                      title="Remover música?"
                      onConfirm={() => handleDelete(m._id)}
                      okText="Sim"
                      cancelText="Não"
                    >
                      <Button danger icon={<DeleteOutlined />}>
                        Remover
                      </Button>
                    </Popconfirm>,
                  ]}
                >
                  <Space direction="vertical" size={4}>
                    <Text strong style={{ fontSize: 16 }}>
                      {m.name}
                    </Text>
                    <Space wrap>
                      <Tag color="blue">{m.sequence?.length} notas</Tag>
                      <Text type="secondary">id: {m._id}</Text>
                    </Space>
                  </Space>
                </List.Item>
              )}
            />
          )}
        </Card>
      </div>
    </div>
  );
};

export default Musicas;
