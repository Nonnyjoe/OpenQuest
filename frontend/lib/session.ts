import { Role } from "./auth";

interface Session {
  isAuthenticated: boolean;
  lastActivity: number;
  expiresAt: number;
  userId?: string;
  user?: any;
}

const SESSION_TIMEOUT = 3600000; // 1 hour in milliseconds

export const sessionManager = {
  startSession(userId: string, userData?: any) {
    const session: Session = {
      isAuthenticated: true,
      lastActivity: Date.now(),
      expiresAt: Date.now() + SESSION_TIMEOUT,
      userId,
      user: userData,
    };
    sessionStorage.setItem("session", JSON.stringify(session));
  },

  updateActivity() {
    const session = this.getSession();
    if (session) {
      session.lastActivity = Date.now();
      session.expiresAt = Date.now() + SESSION_TIMEOUT;
      sessionStorage.setItem("session", JSON.stringify(session));
    }
  },

  getSession(): Session | null {
    const sessionData = sessionStorage.getItem("session");
    return sessionData ? JSON.parse(sessionData) : null;
  },

  clearSession() {
    sessionStorage.removeItem("session");
  },

  isSessionValid(session?: Session | null): boolean {
    if (!session) {
      session = this.getSession();
    }
    if (!session) return false;
    return Date.now() < session.expiresAt;
  },

  canRecover(): boolean {
    const sessionData = sessionStorage.getItem("session");
    if (!sessionData) return false;
    const session = JSON.parse(sessionData);
    return this.isSessionValid(session);
  },
};
