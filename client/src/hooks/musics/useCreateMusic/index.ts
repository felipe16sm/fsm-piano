/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../api";

type MusicSequenceItem = {
  notas: string[];
  duracaoNotas: number;
  tempoEntreNotas: number;
};

type MusicPayload = {
  name: string;
  sequence: MusicSequenceItem[];
};

const useCreateMusic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: MusicPayload) => {
      const response = await api.post("/api/musics", data);
      return response.data;
    },
    retry: false,
    onSuccess: (newMusic) => {
      queryClient.setQueryData(["musics"], (old: any[] = []) => [
        ...old,
        newMusic,
      ]);
    },
  });
};

export default useCreateMusic;
