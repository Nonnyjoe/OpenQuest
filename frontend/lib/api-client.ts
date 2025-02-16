import axios from "axios";
import { toast } from "@/components/ui/use-toast";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Remove CSRF token handling
apiClient.interceptors.request.use((config) => {
  return config;
});

// Simplified error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error("API Error:", {
      status: error.response?.status,
      data: error.response?.data,
      config: error.config,
    });

    if (!error.response) {
      toast({
        title: "Network Error",
        description: "Please check your internet connection",
        variant: "destructive",
      });
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
