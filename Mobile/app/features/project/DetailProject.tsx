// app/features/project/DetailProject.tsx
import React from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

import { API_URL } from "@/constants/api";
import { getAccessToken } from "@/lib/secure-store";

type ProjectDetail = {
  id: number;
  name: string;
  description?: string | null;
  status?: string;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
};

type Owner = { id: number; name?: string; email?: string };

export default function DetailProject() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const projectId = Number(id);
  const router = useRouter();

  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [project, setProject] = React.useState<ProjectDetail | null>(null);
  const [owner, setOwner] = React.useState<Owner | null>(null);

  // ---------- utils ----------
  const pad = (n: number) => String(n).padStart(2, "0");
  const fmtDate = (iso?: string) => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "—";
    return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;
  };

  // hidrata nombre/email con /users/{id} si existe
  const fetchUserProfile = async (uid: number, headers: HeadersInit) => {
    try {
      const res = await fetch(`${API_URL}/users/${uid}`, { headers });
      if (res.ok) {
        const u = await res.json();
        return {
          name: typeof u?.name === "string" ? u.name : undefined,
          email: typeof u?.email === "string" ? u.email : undefined,
        };
      }
    } catch {}
    return {};
  };

  // Encuentra el registro de membresía del usuario en ESTE proyecto y devuelve si es admin + (nombre/email si vienen)
  const findMembershipOnThisProject = (arr: any[], pid: number) => {
    if (!Array.isArray(arr)) return null;

    for (const it of arr) {
      // projectId puede venir plano o anidado en "project"
      const pId =
        (typeof it?.projectId === "number" ? it.projectId : undefined) ??
        (typeof it?.project?.id === "number" ? it.project.id : undefined) ??
        (typeof it?.Project?.id === "number" ? it.Project.id : undefined);

      if (pId !== pid) continue;

      // role puede venir en varias rutas
      const role =
        it?.role ??
        it?.userRole ??
        it?.UserProject?.role ??
        it?.userProject?.role ??
        it?.projectRole ??
        it?.projectRoleType ??
        it?.Role;

      const roleStr = role ? String(role).toLowerCase() : undefined;
      const isAdmin = roleStr === "admin"; // 👈 ESTRICTO: solo admin explícito

      // nombre/email por si el endpoint ya los trae
      const name =
        (typeof it?.user?.name === "string" && it.user.name) ||
        (typeof it?.User?.name === "string" && it.User.name) ||
        undefined;
      const email =
        (typeof it?.user?.email === "string" && it.user.email) ||
        (typeof it?.User?.email === "string" && it.User.email) ||
        undefined;

      return { isAdmin, name, email };
    }
    return null;
  };

  const fetchData = React.useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);

    try {
      const token = await getAccessToken();
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

      // 1) Detalle del proyecto
      const projRes = await fetch(`${API_URL}/projects/${projectId}`, { headers });
      if (!projRes.ok) throw new Error(`No se pudo obtener el proyecto (HTTP ${projRes.status}).`);
      const proj = (await projRes.json()) as ProjectDetail;
      setProject(proj);

      // 2) Usuario logueado
      const currentUserIdStr = await SecureStore.getItemAsync("userId");
      const currentUserId = currentUserIdStr ? Number(currentUserIdStr) : NaN;
      if (!Number.isFinite(currentUserId)) {
        setOwner(null);
        setLoading(false);
        return;
      }

      // 3) Proyectos del usuario -> confirmar si ES admin de ESTE proyecto
      const myProjRes = await fetch(`${API_URL}/projects/user/${currentUserId}`, { headers });
      if (!myProjRes.ok) {
        setOwner(null);
        setLoading(false);
        return;
      }
      const mine = await myProjRes.json();
      const membership = findMembershipOnThisProject(mine, projectId);

      if (!membership || !membership.isAdmin) {
        // No pertenece o NO es admin => no mostrar Owner
        setOwner(null);
      } else {
        // Es admin => es Owner. Sacamos nombre/email (endpoint -> /users/{id} -> SecureStore)
        let name = membership.name || undefined;
        let email = membership.email || undefined;

        if (!name || !email) {
          const prof = await fetchUserProfile(currentUserId, headers);
          name = name || prof.name;
          email = email || prof.email;
        }
        if (!name) name = (await SecureStore.getItemAsync("userName")) || undefined;
        if (!email) email = (await SecureStore.getItemAsync("userEmail")) || undefined;

        setOwner({ id: currentUserId, name, email });
      }
    } catch (e: any) {
      setError(e?.message ?? "Error al cargar el proyecto.");
      setProject(null);
      setOwner(null);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const ownerLabel = owner?.name || owner?.email || (owner ? `Usuario #${owner.id}` : "—");
  const membersCount = owner ? 1 : 0;

  return (
    <View style={{ flex: 1, backgroundColor: "#f2f4f7" }}>
      {/* Header azul */}
      <View
        style={{
          backgroundColor: "#3f3df8",
          paddingTop: 28,
          paddingBottom: 16,
          paddingHorizontal: 16,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ padding: 6 }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialIcons name="arrow-back" size={26} color="#ffffff" />
          </TouchableOpacity>

          <Text
            style={{
              color: "white",
              fontSize: 18,
              fontWeight: "700",
              marginLeft: 12,
              flexShrink: 1,
            }}
            numberOfLines={1}
          >
            {project?.name ?? "Detalle del proyecto"}
          </Text>
        </View>
      </View>

      {/* Contenido */}
      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator />
          <Text style={{ marginTop: 8 }}>Cargando proyecto…</Text>
        </View>
      ) : error ? (
        <ScrollView
          contentContainerStyle={{ padding: 16, flexGrow: 1 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: "#e6e6e6",
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#d00" }}>Error</Text>
            <Text style={{ marginTop: 8, color: "#444" }}>{error}</Text>
          </View>
        </ScrollView>
      ) : !project ? (
        <ScrollView
          contentContainerStyle={{ padding: 16, flexGrow: 1 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: "#e6e6e6",
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "700" }}>Proyecto no encontrado</Text>
            <Text style={{ marginTop: 8, color: "#666" }}>Verifica el ID.</Text>
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {/* Card principal */}
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 16,
              padding: 16,
              marginBottom: 12,
              borderWidth: 1,
              borderColor: "#e6e6e6",
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: "700" }} numberOfLines={2}>
              {project.name}
            </Text>

            <View style={{ marginTop: 10, flexDirection: "row", alignItems: "center" }}>
              <Text style={{ fontSize: 14, color: "#666", width: 110 }}>Estado</Text>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: (project.status || "").toLowerCase() === "active" ? "#1a8f2e" : "#8a8a8a",
                }}
              >
                {project.status ?? "—"}
              </Text>
            </View>

            {/* Owner (solo si el usuario es admin explícito) */}
            <View style={{ marginTop: 8, flexDirection: "row", alignItems: "center" }}>
              <Text style={{ fontSize: 14, color: "#666", width: 110 }}>Owner</Text>
              <Text style={{ fontSize: 14, fontWeight: "600" }}>
                {owner ? `${ownerLabel} (Owner)` : "— (no informado)"}
              </Text>
            </View>

            {/* Fechas */}
            <View style={{ marginTop: 8, flexDirection: "row", alignItems: "center" }}>
              <Text style={{ fontSize: 14, color: "#666", width: 110 }}>Inicio</Text>
              <Text style={{ fontSize: 14 }}>{fmtDate(project.startDate)}</Text>
            </View>
            <View style={{ marginTop: 6, flexDirection: "row", alignItems: "center" }}>
              <Text style={{ fontSize: 14, color: "#666", width: 110 }}>Fin</Text>
              <Text style={{ fontSize: 14 }}>{fmtDate(project.endDate)}</Text>
            </View>

            {/* Descripción */}
            <View style={{ marginTop: 12 }}>
              <Text style={{ fontSize: 14, color: "#666", marginBottom: 6 }}>Descripción</Text>
              <Text style={{ fontSize: 15, color: "#333", lineHeight: 20 }}>
                {project.description?.trim() || "—"}
              </Text>
            </View>
          </View>

          {/* Card Miembros (Owner solo si corresponde) */}
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 16,
              padding: 16,
              marginTop: 8,
              borderWidth: 1,
              borderColor: "#e6e6e6",
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 8 }}>
              Miembros ({owner ? 1 : 0})
            </Text>

            {!owner ? (
              <Text style={{ color: "#666" }}>
                No se pudo determinar el owner (no eres admin de este proyecto).
              </Text>
            ) : (
              <View
                style={{
                  paddingVertical: 10,
                  borderTopWidth: 1,
                  borderTopColor: "#f0f0f0",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View style={{ flexShrink: 1, paddingRight: 8 }}>
                  <Text style={{ fontSize: 14, fontWeight: "600" }}>
                    {ownerLabel} (Owner)
                  </Text>
                  <Text style={{ marginTop: 2, color: "#666", fontSize: 12 }}>
                    Admin
                  </Text>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
