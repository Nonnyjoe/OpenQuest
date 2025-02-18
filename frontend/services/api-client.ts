import axios from "axios";

// Move getCookie to a utility function
const getCookie = (name: string) => {
  if (typeof document === "undefined") return null; // Handle SSR
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
};

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

// Add request interceptor to include token
apiClient.interceptors.request.use(
  (config) => {
    const token = getCookie("token");

    console.log("API Request Debug:", {
      url: config.url,
      method: config.method,
      hasToken: !!token,
      cookies: document.cookie,
      headers: config.headers,
    });

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", {
      status: error.response?.status,
      data: error.response?.data,
      config: error.config,
    });
    return Promise.reject(error);
  }
);

export default apiClient;
