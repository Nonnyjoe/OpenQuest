import { useQuery } from "@tanstack/react-query";
import { protocolService } from "@/services/protocol-service";
import { useAuth } from "@/contexts/auth-context";

export function useAdminProtocols() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["adminProtocols", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const protocols = await protocolService.getAll();
      console.log("All protocols:", protocols);
      console.log("Current user:", user.id);

      const adminProtocols = protocols.filter((protocol) => {
        const isStaff = protocol.staffs?.includes(user.id);
        const isCreator = protocol.created_by === user.id;

        console.log("Protocol:", protocol.name);
        console.log("Is staff:", isStaff);
        console.log("Is creator:", isCreator);

        return isStaff || isCreator;
      });

      console.log("Filtered admin protocols:", adminProtocols);
      return adminProtocols;
    },
    enabled: !!user?.id,
  });
}
