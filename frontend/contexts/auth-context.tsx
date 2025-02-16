"use client";

import { createContext, useContext, useState, useEffect } from "react";
import {
  authService,
  startRefreshTokenInterval,
  stopRefreshTokenInterval,
} from "@/services/auth-service";
import { useToast } from "@/components/ui/use-toast";
import { sessionManager } from "@/lib/session";
import { useRouter } from "next/navigation";
import { Role } from "@/lib/auth";

interface User {
  id: string;
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

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  linkWallet: (walletAddress: string) => Promise<void>;
  hasRole: (requiredRole: Role) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  // Simplified session check
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (sessionManager.canRecover()) {
          const session = sessionManager.getSession();
          if (session?.userId) {
            setUser(session.user);
          }
        }
      } catch (error) {
        console.error("Session recovery failed:", error);
        sessionManager.clearSession();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const userData = await authService.login({ email, password });

      if (!userData) {
        throw new Error("Failed to get user data");
      }

      const user: User = {
        id: userData.user_uuid,
        username: userData.username,
        email: userData.email,
        role: userData.role,
        walletAddress: userData.walletAddress,
        verified: userData.verified,
        created_at: userData.created_at,
        total_reward: userData.total_reward,
        quizzes: userData.quizzes,
        leaderboard_score: userData.leaderboard_score,
      };

      setUser(user);
      sessionManager.startSession(user.id, user);

      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });

      // Role-specific redirects
      if (user.role === "admin") {
        router.push("/admin");
      } else if (user.role === "protocol_admin") {
        router.push("/admin/protocols");
      } else {
        router.push("/dashboard");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: error.response?.data?.message || "Invalid credentials",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string
  ) => {
    try {
      setIsLoading(true);
      const response = await authService.register({
        username,
        email,
        password,
      });

      toast({
        title: "Registration Successful",
        description: "Your account has been created. Please log in.",
      });

      router.push("/login");
    } catch (error: any) {
      console.error("Register error:", error);
      toast({
        title: "Registration Failed",
        description: error.response?.data?.message || "Registration failed",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      // Just clear the session and cookies
      sessionManager.clearSession();
      setUser(null);
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const linkWallet = async (walletAddress: string) => {
    try {
      if (!user) throw new Error("No user logged in");

      await authService.linkWallet({
        user_uuid: user.id,
        wallet_address: walletAddress,
      });

      // Create a new user object with all required properties
      setUser({
        ...user,
        walletAddress: walletAddress,
      } as User);

      toast({
        title: "Wallet Linked",
        description: "Your wallet has been connected successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to link wallet",
        variant: "destructive",
      });
      throw error;
    }
  };

  const hasRole = (requiredRole: Role) => {
    return user?.role === requiredRole;
  };

  useEffect(() => {
    const activityHandler = () => {
      if (user) {
        sessionManager.updateActivity();
      }
    };

    window.addEventListener("mousemove", activityHandler);
    window.addEventListener("keydown", activityHandler);

    return () => {
      window.removeEventListener("mousemove", activityHandler);
      window.removeEventListener("keydown", activityHandler);
    };
  }, [user]);

  useEffect(() => {
    console.log("Current user state:", user);
    console.log("Current cookies:", document.cookie);
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        linkWallet,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
