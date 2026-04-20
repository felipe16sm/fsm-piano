import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../api";



const useDeleteMusic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: string }) => {
      if (!data.id) {
        throw new Error("ID is required");
      }

      const response = await api.delete(`/api/musics/${data.id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["musics"], exact: true });
    },
    retry: false,
  });
};

export default useDeleteMusic;
