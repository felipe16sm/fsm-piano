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

const useUpdateMusic = ({ id }: { id?: string }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: MusicPayload) => {
      if (!id) {
        throw new Error("ID is required");
      }

      const response = await api.put(`/api/musics/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["musics"], exact: true });
      queryClient.invalidateQueries({ queryKey: ["music", id] });
    },
    retry: false,
  });
};

export default useUpdateMusic;
