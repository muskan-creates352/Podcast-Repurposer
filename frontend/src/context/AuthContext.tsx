"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/types";
import { apiLogin } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check saved session on load
    const savedToken = localStorage.getItem("auth_token");
    const savedUser = localStorage.getItem("auth_user");

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
      }
    } else {
      // Auto-set demo user if fresh visitor for easy testing
      const defaultUser: User = {
        id: "usr_demo",
        email: "muskan@podcastrepurposer.ai",
        name: "Muskan Kumari",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Muskan",
      };
      const defaultToken = "mock_jwt_token_sample_abc123";
      localStorage.setItem("auth_token", defaultToken);
      localStorage.setItem("auth_user", JSON.stringify(defaultUser));
      setToken(defaultToken);
      setUser(defaultUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await apiLogin(email, pass);
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem("auth_token", res.token);
      localStorage.setItem("auth_user", JSON.stringify(res.user));
      router.push("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
