import { useQuery } from "@tanstack/react-query";
import { protocolService } from "@/services/protocol-service";

export function useProtocols() {
  return useQuery({
    queryKey: ["protocols"],
    queryFn: protocolService.getAll,
    staleTime: 1000 * 60 * 5,
  });
}

export function useProtocol(id: string) {
  return useQuery({
    queryKey: ["protocol", id],
    queryFn: () => protocolService.getProtocolById(id),
    staleTime: 1000 * 60 * 5,
  });
}
