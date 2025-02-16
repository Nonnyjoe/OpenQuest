"use client";

import { useAuth } from "@/contexts/auth-context";
import { hasRequiredRole, type Role } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: Role;
}

export function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }

    if (!isLoading && requiredRole && !hasRequiredRole(user, requiredRole)) {
      router.push("/dashboard");
    }
  }, [user, isLoading, requiredRole, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user || (requiredRole && !hasRequiredRole(user, requiredRole))) {
    return null;
  }

  return <>{children}</>;
}
