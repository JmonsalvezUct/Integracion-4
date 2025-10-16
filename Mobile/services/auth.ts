// services/auth.ts
import { API_URL } from "@/constants/api";
import { saveAuth } from "@/lib/secure-store";
import { getAccessToken, getRefreshToken, getUserId, clearAuth } from "@/lib/secure-store";
import * as SecureStore from "expo-secure-store"; 

const USER_KEY = "fp.user";

async function saveUserToStore(user: LoginResponse["user"]) {
  try { await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user)); } catch {}
}
export async function getSavedUser(): Promise<LoginResponse["user"] | null> {
  try {
    const raw = await SecureStore.getItemAsync(USER_KEY);
    return raw ? (JSON.parse(raw) as LoginResponse["user"]) : null;
  } catch {
    return null;
  }
}
async function clearSavedUser() {
  try { await SecureStore.deleteItemAsync(USER_KEY); } catch {}
}

// ---------- Types ----------
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

// ---------- Login ----------
export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || `HTTP ${res.status}`);
  }

  const data = (await res.json()) as LoginResponse;

  // Se guarda tokens + id
  await saveAuth({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    userId: data.user.id,
  });

  // se guarda también el usuario completo
  await saveUserToStore(data.user);

  return data;
}

// ---------- Registro ----------
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

  let data: any = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = {}; }

  if (data?.accessToken && data?.refreshToken && data?.user?.id) {
    await saveAuth({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      userId: data.user.id,
    });
    // si el backend devuelve user en /register, también se guarda
    if (data.user) {
      await saveUserToStore(data.user);
    }
  }

  return data as Partial<LoginResponse>;
}

// ---------- Refresh tokens ----------
export async function refreshTokens() {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) throw new Error("No existe un refresh token");

  console.log("auth.refreshTokens: solicitando /auth/refresh");
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  const text = await res.text();
  if (!res.ok) {
    console.error("auth.refreshTokens: el endpoint devolvió un error:", res.status, text);
    throw new Error(text || `HTTP ${res.status}`);
  }

  let data: any = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch (err) {
    console.error("auth.refreshTokens:  error al convertir la respuesta JSON::", err, text);
    throw new Error("El endpoint de refresh devolvió un JSON inválido");
  }

  const newAccess = data?.accessToken;
  const newRefresh = data?.refreshToken;
  let userId = data?.user?.id;

  if (!newAccess || !newRefresh) {
    console.error("auth.refreshTokens: faltan tokens en la respuesta:", data);
    throw new Error("El refresh no devolvió tokens");
  }

  if (userId === undefined || userId === null) {
    //conservar el userId que ya se tenía guardado
    userId = await getUserId();
    if (!userId) {
      console.warn("auth.refreshTokens: el servidor no devolvió userId, se guarda vacío");
      userId = "";
    }
  }

  await saveAuth({
    accessToken: newAccess,
    refreshToken: newRefresh,
    userId,
  });

  // Si el refresh devolvió user, se actualiza; si no, se conserva el guardado
  if (data?.user && data.user.email) {
    await saveUserToStore(data.user);
  } else {
    // nada: mantiene el usuario ya persistido
  }

  // Para quien llame a refreshTokens, se devuelve un "user" consistente
  const storedUser = await getSavedUser();
  const user = data?.user ?? storedUser ?? null;

  console.log("auth.refreshTokens: tokens actualizados (userId=", userId, ")");
  return { accessToken: newAccess, refreshToken: newRefresh, user } as LoginResponse;
}

// ---------- Logout ----------
export async function logout() {
  await clearAuth();
  await clearSavedUser(); //también se borra el usuario persistido
}
