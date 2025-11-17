import { http } from "./http";

export async function login(email: string, password: string) {
  const res = await http.post("/api/auth/login", { email, password });
  return res.data as { accessToken: string; refreshToken: string };
}

export async function register(email: string, password: string, fullName?: string) {
  const res = await http.post("/api/auth/register", { email, password, fullName });
  return res.data;
}

export async function refresh(refreshToken: string) {
  const res = await http.post("/api/auth/refresh", { refreshToken });
  return res.data as { accessToken: string; refreshToken: string };
}
