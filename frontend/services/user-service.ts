import apiClient from "@/services/api-client";

export const userService = {
  async linkWallet(user_uuid: string, wallet_address: string) {
    try {
      const response = await apiClient.post("/user/wallet", {
        user_uuid,
        wallet_address,
      });
      return response.data;
    } catch (error) {
      console.error("Failed to link wallet:", error);
      throw error;
    }
  },
};
