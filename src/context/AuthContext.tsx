import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { login as apiLogin, register as apiRegister } from "../api/auth";

type UserInfo = {
  id: string;
  email: string;
  fullName?: string;
} | null;

type AuthContextType = {
  user: UserInfo;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName?: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserInfo>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem("accessToken");
      const userInfoRaw = await AsyncStorage.getItem("userInfo");
      if (token && userInfoRaw) {
        setUser(JSON.parse(userInfoRaw));
      }
      setLoading(false);
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiLogin(email, password);
    await AsyncStorage.setItem("accessToken", res.accessToken);
    await AsyncStorage.setItem("refreshToken", res.refreshToken);

    // для MVP можно просто сохранить email
    const info: UserInfo = { id: "unknown", email };
    setUser(info);
    await AsyncStorage.setItem("userInfo", JSON.stringify(info));
  };

  const register = async (email: string, password: string, fullName?: string) => {
    await apiRegister(email, password, fullName);
    await login(email, password);
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(["accessToken", "refreshToken", "userInfo"]);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
