import Cookies from "js-cookie";

export const ROLES = {
  USER: "USER",
  ADMIN: "ADMIN",
  PROTOCOL_ADMIN: "PROTOCOL_ADMIN",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export function hasRequiredRole(user: any | null, requiredRole: Role): boolean {
  if (!user) return false;
  return user.role === requiredRole;
}

export function isAuthenticated(): boolean {
  return !!Cookies.get("token");
}
