import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { getAccessToken } from "@/lib/secure-store";
import { usePermissions } from "@/app/features/invitations/hooks/usePermissions";
import DetailProject from "../project/DetailProject";
import EditProject from "../project/EditProject";
import { TaskScreen } from "../task/screens/taskscreen";
import SprintsScreen  from "../task/components/sprintscreen";
import { apiFetch } from "@/lib/api-fetch";
import { ScrollView } from "react-native";
import ProjectInvitationsScreen from "../invitations/screens/ProjectInvitationsScreen";

// 🎨 Tema + layout global
import { useThemedColors } from "@/hooks/use-theme-color";
import LayoutContainer from "@/components/layout/layout_container";
import { CONTAINER } from "@/constants/spacing";
import FullBleed from "@/components/layout/FullBleed";
import { useGutter } from "../../../hooks/use-gutter";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MembersScreen from "../members/screens/MembersScreen"; 

import Loader from "@/components/ui/Loader";
import StatsProjectScreen from "../stats/screens/StatsProjectScreen";

export default function ProjectOverview() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const projectId = (params.projectId || params.id) as string;
  const { role, can } = usePermissions(Number(projectId));

  const [activeTab, setActiveTab] = useState<
  "details" | "tasks" | "edit" | "stats" | "sprints" | "invitations" | "members"
>("details");



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
      <Loader />
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


    <FullBleed>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{
          backgroundColor: TAB_BG,
          borderBottomColor: TAB_BORDER,
          borderBottomWidth: 1,
        }}
        contentContainerStyle={{
          paddingHorizontal: gutter,
        }}
      >
      <View style={styles.tabsRow}>

        {/* Detalles */}
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

        {/* Tareas */}
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

        {/* Editar (SOLO ADMIN) */}
        {can("project", "edit") && (
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
        )}

        {/* Estadísticas (SOLO ADMIN) */}
        {can("project", "stats") && (
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
        )}

        {/* Sprints (TODOS LOS ROLES PUEDEN VER) */}
        {can("sprint", "view") && (
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
        )}

        {/* Invitaciones (SOLO ADMIN) */}
        {can("project", "manageMembers") && (
          <TouchableOpacity
            style={[
              styles.tabBtn,
              activeTab === "invitations" && { borderBottomWidth: 3, borderBottomColor: BRAND },
            ]}
            onPress={() => setActiveTab("invitations")}
          >
            <Text style={[styles.tabText, { color: activeTab === "invitations" ? BRAND : TAB_TEXT }]}>
              Invitaciones
            </Text>
          </TouchableOpacity>
        )}

        {/* Miembros (TODOS LOS ROLES PUEDEN VER) */}
        {can("project", "viewMembers") && (
          <TouchableOpacity
            style={[
              styles.tabBtn,
              activeTab === "members" && { borderBottomWidth: 3, borderBottomColor: BRAND },
            ]}
            onPress={() => setActiveTab("members")}
          >
            <Text style={[styles.tabText, { color: activeTab === "members" ? BRAND : TAB_TEXT }]}>
              Miembros
            </Text>
          </TouchableOpacity>
        )}

      </View>

      </ScrollView>
    </FullBleed>


    {/* Contenido - con gutter normal y bottom compacto según safe-area */}
    <View
      style={[
        styles.content,
        {
          paddingHorizontal: gutter,
          paddingTop: CONTAINER.top,
          paddingBottom: Math.max(8, insets.bottom + 9), 
        },
      ]}
    >
      {activeTab === "details" && <DetailProject />}
      {activeTab === "tasks" && <TaskScreen projectId={projectId} />}
      {activeTab === "edit" && <EditProject projectId={projectId} />}
      {activeTab === "stats" && (
  <StatsProjectScreen projectId={projectId} />
)}



      {activeTab === "invitations" && (
        can("project", "edit") ? (
          <ProjectInvitationsScreen projectId={Number(projectId)} />
        ) : (
          <View style={{ alignItems: "center", marginTop: 40 }}>
            <Text style={{ color: "red", fontWeight: "600" }}>
              No tienes permisos para acceder a esta sección.
            </Text>
          </View>
        )
      )}


{activeTab === "sprints" && (
  <SprintsScreen projectId={projectId} />
)}



  {activeTab === "members" && (
    can("project", "viewMembers") ? (
      <MembersScreen projectId={Number(projectId)} />
    ) : (
      <View style={{ marginTop: 40, alignItems: "center" }}>
        <Text style={{ color: "red", fontWeight: "600" }}>
          No tienes permisos para ver los miembros.
        </Text>
      </View>
    )
  )}

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

  tabText: { fontSize: 15, fontWeight: "600" },
  content: { flex: 1 },
  tabsRow: {
  flexDirection: "row",
  alignItems: "center",
},

tabBtn: {
  paddingVertical: 12,
  paddingHorizontal: 16,
  marginRight: 24,
},

});
