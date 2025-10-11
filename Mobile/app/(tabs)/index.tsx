// app/(tabs)/index.tsx
import React from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";

import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { API_URL } from "@/constants/api";
import { getAccessToken, getUserId } from "@/lib/secure-store";

type Project = { id: number; name: string; activitiesCount?: number };

export default function HomeScreen() {
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [q, setQ] = React.useState("");
  const router = useRouter();

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const userId = await getUserId();
      const token = await getAccessToken();

      if (!userId || !token) {
        setProjects([]);
      } else {
        const res = await fetch(`${API_URL}/projects/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.ok ? await res.json() : [];
        // backend devuelve userProject[] 
        const mapped = Array.isArray(data)
          ? data.map((up: any) => up.project).filter(Boolean)
          : [];
        setProjects(mapped);
      }
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const filtered = q
    ? projects.filter((p) =>
        p.name?.toLowerCase().includes(q.trim().toLowerCase())
      )
    : projects;

  // Función para navegar al detalle del proyecto - RUTA CORREGIDA
  const navigateToProjectDetail = (project: Project) => {
    router.push({
      pathname: "/features/project/DetailProject",
      params: { 
        id: project.id.toString()
      }
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f2f4f7" }}>
      {/* Header menú, buscador y perfil */}
      <View
        style={{
          backgroundColor: "#3f3df8",
          paddingTop: 28,
          paddingBottom: 16,
          paddingHorizontal: 16,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {/* Menú */}
          <TouchableOpacity onPress={() => {}} style={{ padding: 6 }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <MaterialIcons name="menu" size={26} color="#ffffff" />
          </TouchableOpacity>

          {/* Buscador */}
          <View
            style={{
              height: 44,
              borderRadius: 24,
              backgroundColor: "white",
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 12,
              flex: 1,
              marginHorizontal: 12,
            }}
          >
            <MaterialIcons name="search" size={22} color="#9b9b9b" />
            <TextInput
              placeholder="buscar …"
              value={q}
              onChangeText={setQ}
              style={{ flex: 1, marginLeft: 8, fontSize: 16 }}
              placeholderTextColor="#9b9b9b"
            />
          </View>
          
          <TouchableOpacity
            onPress={() => router.push("/features/project/CreateProject")}
            style={{ padding: 6 }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialIcons name="add-circle-outline" size={26} color="#ffffff" />
          </TouchableOpacity>
          
          {/* Perfil */}
          <TouchableOpacity onPress={() => {}} style={{ padding: 6 }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <MaterialIcons name="account-circle" size={26} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Contenido */}
      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator />
          <Text style={{ marginTop: 8 }}>Cargando proyectos…</Text>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={{ padding: 16, flexGrow: 1 }}
          data={filtered}
          keyExtractor={(p) => String(p.id)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListHeaderComponent={
            <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 16 }}>
              Proyectos
            </Text>
          }
          ListEmptyComponent={<View />} 
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => navigateToProjectDetail(item)}
              style={{
                backgroundColor: "white",
                borderRadius: 16,
                padding: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: "#e6e6e6",
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "700" }}>{item.name}</Text>
              {typeof item.activitiesCount === "number" ? (
                <Text style={{ marginTop: 6, color: "#666" }}>
                  {item.activitiesCount} Actividades
                </Text>
              ) : null}
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}