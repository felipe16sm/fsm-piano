import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "../../api";

type MusicSequenceItem = {
  notas: string[];
  duracaoNotas: number;
  tempoEntreNotas: number;
};

type MusicPayload = {
  name: string;
  sequence: MusicSequenceItem[];
};

const useMusic = ({ id }: { id?: string }) => {
  return {
    getMusics: useQuery({
      queryKey: ["musics"],
      queryFn: async () => {
        const { data } = await api.get("/api/musics");
        return data;
      },
      retry: false,
    }),
    getOneMusic: useQuery({
      queryKey: ["music", id],
      queryFn: async () => {
        const { data } = await api.get(`/api/musics/${id}`);
        return data;
      },
      retry: false,
    }),
    createMusic: useMutation({
      mutationFn: async (data: MusicPayload) => {
        const response = await api.post("/api/musics", data);
        return response.data;
      },
      retry: false,
    }),
    updateMusic: useMutation({
      mutationFn: async (data: MusicPayload) => {
        const response = await api.put(`/api/musics/${id}`, data);
        return response.data;
      },
      retry: false,
    }),
    deleteMusic: useMutation({
      mutationFn: async (data: { id: string }) => {
        const response = await api.delete(`/api/musics/${data.id}`);
        return response.data;
      },
      retry: false,
    }),
  };
};

export default useMusic;
