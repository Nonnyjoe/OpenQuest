import apiClient from "@/lib/api-client";
import { sessionManager } from "@/lib/session";

interface RegisterUserDto {
  username: string;
  password: string;
  email: string;
}

interface LoginDto {
  email: string;
  password: string;
}

interface LinkWalletDto {
  user_uuid: string;
  wallet_address: string;
}

interface UserData {
  user_uuid: string;
  username: string;
  email: string;
  role: string;
  walletAddress: string | null;
  verified: boolean;
  created_at: string;
  total_reward: number;
  quizzes: any[];
  leaderboard_score: Record<string, any>;
}

function parseRustStruct(rustString: string): any {
  try {
    // Remove the "User" prefix and trim
    rustString = rustString.replace(/^User\s*/, "").trim();

    // First, handle the nested structures
    let jsonLikeString = rustString
      // Handle Email struct
      .replace(/Email\s*{\s*([^}]+)}/g, (_, content) => {
        const emailContent = content.replace(/(\w+):\s*/g, '"$1":');
        return `{${emailContent}}`;
      })
      // Handle Wallet struct
      .replace(/Wallet\s*{\s*([^}]+)}/g, (_, content) => {
        const walletContent = content.replace(/(\w+):\s*/g, '"$1":');
        return `{${walletContent}}`;
      })
      // Handle Password struct (remove it for security)
      .replace(/Password\s*{[^}]+}/g, "{}")
      // Add quotes to all keys
      .replace(/(\w+):\s*/g, '"$1":')
      // Replace None with null
      .replace(/None/g, "null")
      // Clean up any remaining issues
      .replace(/,\s*}/g, "}")
      .replace(/:\s+/g, ":")
      .replace(/,\s+/g, ",");

    console.log("Cleaned string:", jsonLikeString);
    return JSON.parse(jsonLikeString);
  } catch (error) {
    console.error("Parse error:", error);
    throw error;
  }
}

export const authService = {
  async register(data: RegisterUserDto) {
    const response = await apiClient.post("/user/register", data);
    console.log("Register Response:", response.data);
    return response.data;
  },

  async login(data: LoginDto): Promise<UserData> {
    try {
      const response = await apiClient.post("/user/login", data, {
        withCredentials: true,
      });

      if (response.status === 200) {
        const userResponse = await apiClient.get(
          `/user/by-email/${data.email}`
        );
        const rustResponse = userResponse.data;

        // Extract user data using pattern matching
        const matches = rustResponse.match(
          /User\s*{\s*user_uuid:\s*"([^"]+)",\s*user_name:\s*"([^"]+)",\s*email:\s*Email\s*{\s*email:\s*"([^"]+)",\s*verified:\s*(true|false)/
        );

        if (!matches) {
          throw new Error("Failed to parse user data");
        }

        // Extract wallet address if present
        const walletMatch = rustResponse.match(/wallet_address:\s*"([^"]+)"/);
        const walletAddress = walletMatch ? walletMatch[1] : null;

        // Destructure matched groups
        const [_, user_uuid, user_name, email, verified] = matches;

        return {
          user_uuid,
          username: user_name,
          email,
          role: "user",
          walletAddress,
          verified: verified === "true",
          created_at: new Date().toISOString(),
          total_reward: 0,
          quizzes: [],
          leaderboard_score: {},
        };
      }

      throw new Error("Login failed");
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  async logout() {
    sessionManager.clearSession();
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  },

  async linkWallet(data: LinkWalletDto) {
    const response = await apiClient.post("/user/wallet", data);
    return response.data;
  },

  async getAllUsers() {
    const response = await apiClient.get("/users");
    return response.data;
  },

  async getUserByEmail(email: string) {
    const response = await apiClient.get(`/user/by-email/${email}`);
    return response.data;
  },

  async getUserById(userId: string): Promise<UserData> {
    try {
      const response = await apiClient.get(`/user/by-id/${userId}`);
      const rustResponse = response.data;

      const matches = rustResponse.match(
        /User\s*{\s*user_uuid:\s*"([^"]+)",\s*user_name:\s*"([^"]+)",\s*email:\s*Email\s*{\s*email:\s*"([^"]+)",\s*verified:\s*(true|false)/
      );

      if (!matches) {
        throw new Error("Failed to parse user data");
      }

      const [_, user_uuid, user_name, email, verified] = matches;
      const walletMatch = rustResponse.match(/wallet_address:\s*"([^"]+)"/);

      return {
        user_uuid,
        username: user_name,
        email,
        role: "user",
        walletAddress: walletMatch ? walletMatch[1] : null,
        verified: verified === "true",
        created_at: new Date().toISOString(),
        total_reward: 0,
        quizzes: [],
        leaderboard_score: {},
      };
    } catch (error) {
      console.error("Get user error:", error);
      throw error;
    }
  },

  async checkAuth() {
    try {
      // The cookie will be automatically sent with the request
      const response = await apiClient.get("/user/me");
      return true;
    } catch (error) {
      return false;
    }
  },

  async healthCheck() {
    try {
      const response = await apiClient.get("/health");
      return response.data;
    } catch (error) {
      console.error("Health check failed:", error);
      throw error;
    }
  },
};

export function startRefreshTokenInterval() {}
export function stopRefreshTokenInterval() {}
