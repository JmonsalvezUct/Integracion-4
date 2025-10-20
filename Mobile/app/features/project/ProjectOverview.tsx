import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { getAccessToken } from "@/lib/secure-store";

import DetailProject from "../project/DetailProject";
import EditProject from "../project/EditProject";
import { TaskScreen } from "../task/screens/taskscreen";
import { apiFetch } from "@/lib/api-fetch";

// 🎨 Hook de colores centralizado
import { useThemedColors } from "@/hooks/use-theme-color";

export default function ProjectOverview() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const projectId = (params.projectId || params.id) as string;

  const [activeTab, setActiveTab] = useState<"details" | "tasks" | "edit">("details");
  const [projectName, setProjectName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  //temas
  const { isDark, BG, TEXT, BRAND } = useThemedColors();
  const TAB_BG = isDark ? "#141414" : "#ffffff";
  const TAB_BORDER = isDark ? "#2a2a2a" : "#E5E5E5";
  const TAB_TEXT = isDark ? "#b3b3b3" : "#555";

  useEffect(() => {
    const loadProjectName = async () => {
      try {
        const token = await getAccessToken();
        if (!token) return;

        const res = await apiFetch(`/projects/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setProjectName(data.name);
      } catch (err) {
        console.error("Error al cargar nombre del proyecto:", err);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) loadProjectName();
  }, [projectId]);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: BG }]}>
        <ActivityIndicator size="large" color={BRAND} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: BG }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: BRAND }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {projectName || `Proyecto #${projectId}`}
        </Text>
      </View>

      {/* Tabs */}
      <View
        style={[
          styles.tabs,
          { backgroundColor: TAB_BG, borderBottomColor: TAB_BORDER },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.tabBtn,
            activeTab === "details" && { borderBottomWidth: 3, borderBottomColor: BRAND },
          ]}
          onPress={() => setActiveTab("details")}
        >
          <Text style={[styles.tabText, { color: activeTab === "details" ? BRAND : TAB_TEXT }]}>
            Detalles
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabBtn,
            activeTab === "tasks" && { borderBottomWidth: 3, borderBottomColor: BRAND },
          ]}
          onPress={() => setActiveTab("tasks")}
        >
          <Text style={[styles.tabText, { color: activeTab === "tasks" ? BRAND : TAB_TEXT }]}>
            Tareas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabBtn,
            activeTab === "edit" && { borderBottomWidth: 3, borderBottomColor: BRAND },
          ]}
          onPress={() => setActiveTab("edit")}
        >
          <Text style={[styles.tabText, { color: activeTab === "edit" ? BRAND : TAB_TEXT }]}>
            Editar
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contenido */}
      <View style={[styles.content, { backgroundColor: BG }]}>
        {activeTab === "details" && <DetailProject />}
        {activeTab === "tasks" && <TaskScreen projectId={projectId} />}
        {activeTab === "edit" && <EditProject projectId={projectId} />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    marginRight: 12,
    backgroundColor: "rgba(0,0,0,0.15)",
    padding: 6,
    borderRadius: 8,
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
  tabs: {
    flexDirection: "row",
    justifyContent: "center",
    borderBottomWidth: 1,
  },
  tabBtn: { flex: 1, alignItems: "center", paddingVertical: 12 },
  tabText: { fontSize: 15, fontWeight: "600" },
  content: { flex: 1, padding: 10 },
});
