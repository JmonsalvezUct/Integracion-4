import React from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { getAccessToken, getUserId } from "@/lib/secure-store";
import { apiFetch } from "@/lib/api-fetch";
import { useFocusEffect } from "@react-navigation/native";

//Tema global y paleta
import { useThemeMode } from "@/app/theme-context";
import { Colors } from "@/constants/theme";

import Loader from "@/components/ui/Loader";
import { LogBox } from "react-native"; // Ignora el warning del loader 
LogBox.ignoreLogs([
  'A props object containing a "key" prop is being spread into JSX',
]);

type Project = { id: number; name: string; activitiesCount?: number };

export default function HomeScreen() {
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [q, setQ] = React.useState("");
  const router = useRouter();

  // tema
  const { theme } = useThemeMode(); // 'light' | 'dark'
  const isDark = theme === "dark";
  const BG = Colors[theme].background;          // fondo de pantalla
  const TEXT = Colors[theme].text;              // texto principal
  const CARD_BG = isDark ? "#1f1f1f" : "#ffffff";
  const CARD_BORDER = isDark ? "#2a2a2a" : "#e6e6e6";
  const PLACEHOLDER = isDark ? "#9aa0a6" : "#9b9b9b";
  const INPUT_TEXT = TEXT;
  const BRAND = Colors.light.tint || "#3B34FF"; // tu azul de marca (header e iconos)

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const userId = await getUserId();
      const token = await getAccessToken();

      if (!userId || !token) {
        setProjects([]);
      } else {
        const res = await apiFetch(`/projects/user/${userId}`);

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

  useFocusEffect(
    React.useCallback(() => {
      load();
    }, [load])
  );

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

  // Navegación
  const navigateToProjectDetail = (project: Project) => {
    router.push({
      pathname: "/features/project/ProjectOverview",
      params: {
        id: project.id.toString(),
      },
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      {/* Header menú, buscador y perfil */}
      <View
        style={{
          backgroundColor: BRAND,    // mantenemos color de marca
          paddingTop: 28,
          paddingBottom: 16,
          paddingHorizontal: 16,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {/* Menú */}
          <TouchableOpacity
            onPress={() => {}}
            style={{ padding: 6 }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialIcons name="menu" size={26} color="#ffffff" />
          </TouchableOpacity>

          {/* Buscador */}
          <View
            style={{
              height: 44,
              borderRadius: 24,
              backgroundColor: isDark ? "#2a2a2a" : "#ffffff",
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 12,
              flex: 1,
              marginHorizontal: 12,
            }}
          >
            <MaterialIcons name="search" size={22} color={PLACEHOLDER} />
            <TextInput
              placeholder="buscar …"
              value={q}
              onChangeText={setQ}
              style={{ flex: 1, marginLeft: 8, fontSize: 16, color: INPUT_TEXT }}
              placeholderTextColor={PLACEHOLDER}
            />
          </View>



          {/* Perfil */}
          <TouchableOpacity
            onPress={() => {}}
            style={{ padding: 6 }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialIcons name="account-circle" size={26} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Contenido */}
      {loading ? (
          <Loader/>
        ) : (
        <FlatList
          contentContainerStyle={{ padding: 16, flexGrow: 1 }}
          data={filtered}
          keyExtractor={(p) => String(p.id)}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListHeaderComponent={
            <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 16, color: TEXT }}>
              Proyectos
            </Text>
          }
          ListEmptyComponent={<View />}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => navigateToProjectDetail(item)}
              style={{
                backgroundColor: CARD_BG,
                borderRadius: 16,
                padding: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: CARD_BORDER,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "700", color: TEXT }}>
                {item.name}
              </Text>
              {typeof item.activitiesCount === "number" ? (
                <Text style={{ marginTop: 6, color: isDark ? "#b3b3b3" : "#666" }}>
                  {item.activitiesCount} Actividades
                </Text>
              ) : null}
            </TouchableOpacity>

            
          )}
        />
      )}

    <TouchableOpacity
      style={styles.fab}
      onPress={() => router.push("/features/project/CreateProject")}
    >
      <MaterialIcons name="add" size={28} color="#fff" />
    </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 20,
    bottom: 25,
    backgroundColor: "#3B34FF", // tu color de marca
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6, // sombra Android
    shadowColor: "#000", // sombra iOS
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});

