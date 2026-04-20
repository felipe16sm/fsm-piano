import { useQuery } from "@tanstack/react-query";
import { api } from "../../../api";

const useGetMusics = () => {
  return useQuery({
    queryKey: ["musics"],
    queryFn: async () => {
      const { data } = await api.get("/api/musics");
      return data;
    },
    retry: false,
  });
};

export default useGetMusics;
