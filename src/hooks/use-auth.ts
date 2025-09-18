"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const login = (redirectTo?: string) => {
    const loginUrl = redirectTo
      ? `/login?redirect=${encodeURIComponent(redirectTo)}`
      : "/login";
    router.push(loginUrl);
  };

  const logout = async (redirectTo?: string) => {
    await signOut({
      redirect: false,
    });

    const logoutUrl = redirectTo || "/";
    router.push(logoutUrl);
  };

  return {
    user: session?.user,
    isLoading: status === "loading",
    isAuthenticated: !!session,
    login,
    logout,
  };
}

// Alternative JWT-based auth hook for API routes
export function useJWTAuth() {
  const getAuthHeaders = () => {
    const token = localStorage.getItem("auth-token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const setToken = (token: string) => {
    localStorage.setItem("auth-token", token);
  };

  const removeToken = () => {
    localStorage.removeItem("auth-token");
  };

  const isTokenValid = () => {
    const token = localStorage.getItem("auth-token");
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const now = Date.now() / 1000;
      return payload.exp > now;
    } catch {
      return false;
    }
  };

  return {
    getAuthHeaders,
    setToken,
    removeToken,
    isTokenValid,
  };
}
