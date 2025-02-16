import apiClient from "@/lib/api-client";

export interface Protocol {
  protocol_uuid: string;
  name: string;
  staffs: string[];
  protocol_users: string[];
  created_at: string;
  created_by: string;
  quizes: any[];
  total_expense: number;
  contract_address: string;
}

export interface UIProtocol {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  members: string[];
  totalQuizzes: number;
  totalHackathons: number;
  totalRewards: string;
  website: string;
  tags: string[];
  status: "active" | "upcoming";
  logo: string;
  staffs: string[];
  created_by: string;
}

interface RegisterProtocolDto {
  name: string;
}

interface AddProtocolStaffDto {
  protocol_name: string;
  staff_uuid: string;
}

export const protocolService = {
  async getAll(): Promise<UIProtocol[]> {
    try {
      const response = await apiClient.get("/protocols");
      console.log("1. Raw response:", response.data);

      // Clean the string - remove outer "Protocol" and brackets
      const cleanData = response.data
        .replace(/^\[Protocol\s*/, "") // Remove opening [Protocol
        .replace(/\]$/, "") // Remove closing ]
        .split(/,\s*Protocol\s*/); // Split on ", Protocol"

      console.log("2. After splitting:", cleanData);

      // Parse each protocol string
      const protocols = cleanData.map((protocolStr: string) => {
        console.log("3. Processing protocol string:", protocolStr);

        // Extract values using simple string operations
        const uuid = protocolStr.match(/protocol_uuid:\s*"([^"]+)"/)?.[1];
        const name = protocolStr.match(/name:\s*"([^"]+)"/)?.[1];
        const created_at = protocolStr.match(/created_at:\s*"([^"]+)"/)?.[1];
        const total_expense = protocolStr.match(
          /total_expense:\s*([\d.]+)/
        )?.[1];
        const staffs = protocolStr.match(/staffs:\s*(\[[^\]]*\])/)?.[1];
        const created_by = protocolStr.match(/created_by:\s*"([^"]+)"/)?.[1];

        console.log("4. Extracted values:", {
          uuid,
          name,
          created_at,
          total_expense,
          staffs,
          created_by,
        });

        return {
          id: uuid,
          name,
          description: "",
          createdAt: created_at,
          members: [],
          totalQuizzes: 0,
          totalHackathons: 0,
          totalRewards: `${parseFloat(total_expense || "0")} USDC`,
          website: "",
          tags: [],
          status: "active" as const,
          logo: `/logos/${name?.toLowerCase()}-logo.png`,
          staffs: JSON.parse(staffs || "[]"),
          created_by,
        };
      });

      console.log("5. Final protocols:", protocols);
      return protocols;
    } catch (error) {
      console.error("Failed to fetch protocols:", error);
      throw error;
    }
  },

  async getProtocolById(id: string) {
    const response = await apiClient.get(`/protocols/${id}`);
    return response.data;
  },

  async getProtocolByName(name: string) {
    const response = await apiClient.get(`/protocols/search?name=${name}`);
    return response.data;
  },

  async register(data: { name: string }) {
    const response = await apiClient.post("/protocols", data);
    return response.data;
  },

  async addStaff(data: AddProtocolStaffDto) {
    const response = await apiClient.post("/protocol/team", data);
    return response.data;
  },

  async isProtocolAdmin(userId: string): Promise<boolean> {
    try {
      const protocols = await this.getAll();
      return protocols.some(
        (protocol) =>
          protocol.staffs?.includes(userId) || protocol.created_by === userId
      );
    } catch (error) {
      console.error("Failed to check protocol admin status:", error);
      return false;
    }
  },
};
