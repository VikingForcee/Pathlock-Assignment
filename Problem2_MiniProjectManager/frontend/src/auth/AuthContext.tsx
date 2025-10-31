import React, { createContext, useContext, useState } from "react";
import api from "../api/apiClient";

interface AuthContextType {
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));

  const login = async (email: string, password: string) => {
    const res = await api.post("/api/v1/auth/login", { email, password });
    const data = res.data;
    localStorage.setItem("token", data.token);
    setToken(data.token);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return <AuthContext.Provider value={{ token, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth() must be used within AuthProvider");
  return ctx;
};
