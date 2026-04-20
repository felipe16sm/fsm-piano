import { useQuery } from "@tanstack/react-query";
import { api } from "../../../api";

const useGetOneMusic = ({ id }: { id?: string }) => {
  return useQuery({
    queryKey: ["music", id],
    queryFn: async () => {
      const { data } = await api.get(`/api/musics/${id}`);
      return data;
    },
    enabled: !!id,
    retry: false,
  });
};

export default useGetOneMusic;
