// services/auth.ts
import { API_URL } from "@/constants/api";
import { saveAuth } from "@/lib/secure-store";
import { getAccessToken, getRefreshToken, getUserId, clearAuth } from "@/lib/secure-store";
import * as SecureStore from "expo-secure-store";

const USER_KEY = "fp.user";

// ---------- Helper: mensajes legibles para errores ----------
type ZodErrorShape = {
  formErrors?: string[];
  fieldErrors?: Record<string, string[] | undefined>;
};

function mapAuthError(status: number, data?: any): string {
  if (status === 401 || status === 403) return "Credenciales inválidas";
  if (status === 429) return "Demasiados intentos. Inténtalo más tarde";
  if (status >= 500) return "Error del servidor. Inténtalo más tarde";

  const fe: ZodErrorShape["fieldErrors"] | undefined =
    data?.details?.fieldErrors ?? data?.fieldErrors;

  if (fe) {
    const emailBad = Array.isArray(fe.email) && fe.email.length > 0;
    const passBad = Array.isArray(fe.password) && fe.password.length > 0;

    if (emailBad && passBad) return "Correo y contraseña inválidos";
    if (emailBad) return "Correo inválido";
    if (passBad) {
      const msg = ((fe.password?.[0] as string) || "").toLowerCase();
      if (msg.includes("too small") || msg.includes(">=8")) {
        return "La contraseña debe tener al menos 8 caracteres";
      }
      return "Contraseña inválida";
    }
    return "Datos inválidos";
  }

  return data?.message || data?.error || "No se pudo iniciar sesión";
}

// ---------- User store ----------
async function saveUserToStore(user: LoginResponse["user"]) {
  try {
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
  } catch {}
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
  try {
    await SecureStore.deleteItemAsync(USER_KEY);
  } catch {}
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
    let data: any = null;
    try {
      data = await res.json();
    } catch {
      // el backend no devolvió JSON válido
    }
    throw new Error(mapAuthError(res.status, data));
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
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }

  if (data?.accessToken && data?.refreshToken && data?.user?.id) {
    await saveAuth({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      userId: data.user.id,
    });
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
    console.error("auth.refreshTokens: error al convertir la respuesta JSON:", err, text);
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

  if (data?.user && data.user.email) {
    await saveUserToStore(data.user);
  }

  const storedUser = await getSavedUser();
  const user = data?.user ?? storedUser ?? null;

  console.log("auth.refreshTokens: tokens actualizados (userId=", userId, ")");
  return { accessToken: newAccess, refreshToken: newRefresh, user } as LoginResponse;
}

// ---------- Logout ----------
export async function logout() {
  await clearAuth();
  await clearSavedUser();
}
