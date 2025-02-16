"use client";

import { useState, useEffect } from "react";
import { authService } from "@/services/auth-service";
import { useAuth } from "@/contexts/auth-context";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { ROLES } from "@/lib/auth";

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [searchEmail, setSearchEmail] = useState("");
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const debouncedSearch = useDebounce(searchEmail, 500);

  useEffect(() => {
    // Check if user has admin role
    if (!user || user.role !== ROLES.ADMIN) {
      router.push("/dashboard");
      return;
    }

    async function fetchUsers() {
      setIsLoading(true);
      try {
        if (debouncedSearch) {
          const user = await authService.getUserByEmail(debouncedSearch);
          setUsers(user ? [user] : []);
        } else {
          const allUsers = await authService.getAllUsers();
          setUsers(allUsers);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUsers();
  }, [debouncedSearch, user]);

  // ... rest of the component
}
