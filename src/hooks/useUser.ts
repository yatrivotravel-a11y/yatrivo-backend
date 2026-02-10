"use client";

import { useState, useEffect } from "react";
import { User } from "@/types";
import { apiRequest } from "@/lib/api";

export function useUser(userId?: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const response = await apiRequest<User>(`/users/${userId}`);
        if (response.success && response.data) {
          setUser(response.data);
        } else {
          setError(response.error || "Failed to fetch user");
        }
      } catch (err) {
        setError("An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [userId]);

  return { user, loading, error };
}
