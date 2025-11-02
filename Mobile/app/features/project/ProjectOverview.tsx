import React, { useState, useEffect } from "react";
import {
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
import SprintsScreen  from "../task/components/sprintscreen";
import { apiFetch } from "@/lib/api-fetch";

// 🎨 Tema + layout global
import { useThemedColors } from "@/hooks/use-theme-color";
import LayoutContainer from "@/components/layout/layout_container";
import { CONTAINER } from "@/constants/spacing";
import FullBleed from "@/components/layout/FullBleed";
import { useGutter } from "../../../hooks/use-gutter";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import StatsProjectScreen from "../stats/screens/StatsProjectScreen";

export default function ProjectOverview() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const projectId = (params.projectId || params.id) as string;

  const [activeTab, setActiveTab] = useState<"details" | "tasks" | "edit" | "stats" | "sprints">("details");

  const [projectName, setProjectName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const { isDark, BG, TEXT, BRAND } = useThemedColors();
  const TAB_BG = isDark ? "#141414" : "#ffffff";
  const TAB_BORDER = isDark ? "#2a2a2a" : "#E5E5E5";
  const TAB_TEXT = isDark ? "#b3b3b3" : "#555";

  const insets = useSafeAreaInsets();
  const gutter = useGutter();

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
      <LayoutContainer scroll={false} style={{ backgroundColor: BG }}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND} />
        </View>
      </LayoutContainer>
    );
  }

  return (
    <LayoutContainer scroll={false} style={{ backgroundColor: BG }}>
    {/* Header - full-bleed, con padding interno */}
    <FullBleed>
      <View style={[styles.header, { backgroundColor: BRAND }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {projectName || `Proyecto #${projectId}`}
        </Text>
      </View>
    </FullBleed>

    {/* Tabs - full-bleed, pero reintroducimos paddingHorizontal */}
    <FullBleed>
      <View
        style={[
          styles.tabs,
          {
            backgroundColor: TAB_BG,
            borderBottomColor: TAB_BORDER,
            paddingHorizontal: gutter, // padding interno
          },
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


        <TouchableOpacity
          style={[
            styles.tabBtn,
            activeTab === "stats" && { borderBottomWidth: 3, borderBottomColor: BRAND },
          ]}
          onPress={() => setActiveTab("stats")}
        >
          <Text style={[styles.tabText, { color: activeTab === "stats" ? BRAND : TAB_TEXT }]}>
            Estadísticas
          </Text>
        </TouchableOpacity>
          
        <TouchableOpacity
          style={[
            styles.tabBtn,
            activeTab === "sprints" && { borderBottomWidth: 3, borderBottomColor: BRAND },
          ]}
          onPress={() => setActiveTab("sprints")}
        >
          <Text style={[styles.tabText, { color: activeTab === "sprints" ? BRAND : TAB_TEXT }]}>
            Sprints
          </Text>
        </TouchableOpacity>

        
      </View>
    </FullBleed>

    {/* Contenido - con gutter normal y bottom compacto según safe-area */}
    <View
      style={[
        styles.content,
        {
          paddingHorizontal: gutter,
          paddingTop: CONTAINER.top,
          paddingBottom: Math.max(8, insets.bottom + 8), // menos “hueco” inferior
        },
      ]}
    >
      {activeTab === "details" && <DetailProject />}
      {activeTab === "tasks" && <TaskScreen projectId={projectId} />}
      {activeTab === "edit" && <EditProject projectId={projectId} />}
      {activeTab === "stats" && <StatsProjectScreen projectId={projectId} />}
      {activeTab === "sprints" && <SprintsScreen projectId={projectId} />}

    </View>
  </LayoutContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: CONTAINER.horizontal,
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
  content: { flex: 1 },
});
