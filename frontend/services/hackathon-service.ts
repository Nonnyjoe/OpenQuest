import apiClient from "@/lib/api-client";

interface Hackathon {
  id: string;
  title: string;
  description: string;
  status: "draft" | "active" | "completed";
  startDate: string;
  endDate: string;
  reward: string;
  participants: number;
}

export const hackathonService = {
  async getHackathonsByProtocol(protocolId: string): Promise<Hackathon[]> {
    try {
      const response = await apiClient.get(
        `/protocols/${protocolId}/hackathons`
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch hackathons:", error);
      return [];
    }
  },
};
