// services/auth.ts
import { API_URL } from "@/constants/api";
import { saveAuth } from "@/lib/secure-store";
import { getAccessToken, getRefreshToken, clearAuth } from "@/lib/secure-store";

//Login
export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string | number;
    name: string;
    email: string;
    profilePicture?: string | null;
  };
};

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    //leer mensaje de error del backend
    const msg = await res.text();
    throw new Error(msg || `HTTP ${res.status}`);
  }

  const data = (await res.json()) as LoginResponse;

  // >>> Guarda lo que te pidieron:
  await saveAuth({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    userId: data.user.id,
  });

  return data;
}

//Registro
export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

export async function registerUser(payload: RegisterPayload) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || `HTTP ${res.status}`);
  }

  // Puede que el register devuelva solo el usuario,
  // o también tokens. Soporta ambas cosas.
  let data: any = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = {}; }

  if (data?.accessToken && data?.refreshToken && data?.user?.id) {
    await saveAuth({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      userId: data.user.id,
    });
  }

  return data;
}

// Renueva tokens
export async function refreshTokens() {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token");

  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  const text = await res.text();
  if (!res.ok) throw new Error(text || `HTTP ${res.status}`);

  const data = JSON.parse(text) as LoginResponse; // mismo shape: accessToken, refreshToken, user
  await saveAuth({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    userId: data.user.id,
  });

  return data;
}

// Cierra sesión (borra tokens + id)
export async function logout() {
  await clearAuth();
}