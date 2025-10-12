// services/auth.ts
import { API_URL } from "@/constants/api";
import { saveAuth } from "@/lib/secure-store";
import { getAccessToken, getRefreshToken, getUserId, clearAuth } from "@/lib/secure-store";

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
    
    const msg = await res.text();
    throw new Error(msg || `HTTP ${res.status}`);
  }

  const data = (await res.json()) as LoginResponse;

  
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
  if (!refreshToken) throw new Error("No existe un refresh token");

  console.log("auth.refreshTokens: solicitando /auth/refresh");
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  //Lee respuesta del servidor
  const text = await res.text();
  if (!res.ok) {
    console.error("auth.refreshTokens: el endpoint devolvió un error:", res.status, text);
    throw new Error(text || `HTTP ${res.status}`);
  }

  //Convierte respuesta de texto a objeto javaScript
  let data: any = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch (err) {
    console.error("auth.refreshTokens:  error al convertir la respuesta JSON::", err, text);
    throw new Error("El endpoint de refresh devolvió un JSON inválido");
  }

  // Extrae los nuevos tokens del backend
  const newAccess = data?.accessToken;
  const newRefresh = data?.refreshToken;
  let userId = data?.user?.id;

  if (!newAccess || !newRefresh) {
    console.error("auth.refreshTokens: faltan tokens en la respuesta:", data);
    throw new Error("El refresh no devolvió tokens");
  }

  if (userId === undefined || userId === null) {
    // fallback: keep existing stored userId if server didn't return it
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

  console.log("auth.refreshTokens: tokens actualizados (userId=", userId, ")");
  return { accessToken: newAccess, refreshToken: newRefresh, user: data?.user } as LoginResponse;
}

// Cierra sesión (borra tokens + id)
export async function logout() {
  await clearAuth();
}