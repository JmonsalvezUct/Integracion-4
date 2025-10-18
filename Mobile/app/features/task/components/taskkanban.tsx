import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Dimensions,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { apiFetch } from "@/lib/api-fetch";
import type { Task } from "../types";

// Estado conocido en el Kanban (los valores manejados internamente)
type Status = "created" | "in_progress" | "completed" | "archived";

type ColumnsState = Record<Status, Task[]>;

const STATUS_ORDER: Status[] = ["created", "in_progress", "completed", "archived"];
const STATUS_LABEL: Record<Status, string> = {
  created: "created",
  in_progress: "in_progress",
  completed: "completed",
  archived: "archived",
};
const STATUS_COLOR: Record<Status, string> = {
  created: "#3B34FF",
  in_progress: "#2E86DE",
  completed: "#27AE60",
  archived: "#7F8C8D",
};

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

export function TaskKanban({ tasks: externalTasks }: { tasks?: Task[] } = {}) {
  const params = useLocalSearchParams();
  // toma projectId desde params
const projectId = useMemo<number | null>(() => {
  const raw = Array.isArray(params?.projectId) ? params.projectId[0] : params?.projectId;
  const n = raw != null ? Number(raw) : NaN;
  return Number.isFinite(n) ? n : null;
}, [params]);

  const [columns, setColumns] = useState<ColumnsState>({
    created: [],
    in_progress: [],
    completed: [],
    archived: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

     
      const res = await apiFetch(`/tasks/project/${projectId}`);
      const text = await res.text();
      if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
      const data: Task[] = text ? JSON.parse(text) : [];

      const next: ColumnsState = {
        created: [],
        in_progress: [],
        completed: [],
        archived: [],
      };
      for (const t of data) {
        
        
        const raw = (t as any).status as string | undefined;
        const normalized = STATUS_ORDER.includes(raw as Status) ? (raw as Status) : "created";
        next[normalized].push({ ...(t as any), status: normalized } as Task);
      }
      setColumns(next);
    } catch (err: any) {
      console.error("Kanban.fetchTasks error:", err?.message ?? err);
      setErrorMsg("No se pudieron cargar las tareas.");
      // Si se dejan columnas vacías aparece “Sin tareas”
      setColumns({
        created: [],
        in_progress: [],
        completed: [],
        archived: [],
      });
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    
    if (externalTasks) {
      
      const next: ColumnsState = {
        created: [],
        in_progress: [],
        completed: [],
        archived: [],
      };
      for (const t of externalTasks) {
        const raw = (t as any).status as string | undefined;
        const normalized = STATUS_ORDER.includes(raw as Status) ? (raw as Status) : "created";
        next[normalized].push({ ...(t as any), status: normalized } as Task);
      }
      setColumns(next);
      setLoading(false);
      return;
    }

    fetchTasks();
  }, [fetchTasks]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTasks();
    setRefreshing(false);
  }, [fetchTasks]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={{ marginTop: 8 }}>Cargando tareas…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {STATUS_ORDER.map((status) => (
          <View key={status} style={[styles.column, { width: SCREEN_WIDTH * 0.85 }]}>
            <View style={styles.columnHeader}>
              <View style={[styles.dot, { backgroundColor: STATUS_COLOR[status] }]} />
              <Text style={styles.columnTitle}>{STATUS_LABEL[status]}</Text>
            </View>

            {errorMsg ? (
              <View style={styles.empty}>
                <Text style={[styles.emptyText, { color: "#d9534f" }]}>{errorMsg}</Text>
              </View>
            ) : columns[status].length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>Sin tareas</Text>
              </View>
            ) : (
              // Cada columna puede necesitar scroll vertical si tiene muchas tarjetas.
              
              <ScrollView
                nestedScrollEnabled
                showsVerticalScrollIndicator
                style={{ maxHeight: SCREEN_HEIGHT - 180 }}
                contentContainerStyle={{ paddingBottom: 12 }}
              >
                {columns[status].map((task) => (
                  <View key={task.id} style={styles.card}>
                    <Text numberOfLines={2} style={styles.cardTitle}>
                      {task.title}
                    </Text>
                    <Text style={styles.cardMeta}>#{task.id} • {task.status}</Text>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },

  column: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    padding: 12,
    marginRight: 12,
  },
  columnHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  columnTitle: { fontWeight: "800", fontSize: 16 },

  empty: {
    height: 80,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: { color: "#9aa1a9", fontStyle: "italic" },

  card: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ececec",
    backgroundColor: "#fafafa",
    padding: 10,
    marginBottom: 8,
    justifyContent: "center",
    minHeight: 70,
  },
  cardTitle: { fontWeight: "700" },
  cardMeta: { marginTop: 4, fontSize: 12, color: "#7e8590" },
});
