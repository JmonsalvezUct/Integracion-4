import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { DeviceEventEmitter } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { Alert } from "react-native";

const TASK_UPDATED = "TASK_UPDATED";

/* ========= Tipos / Constantes ========= */
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

// ↔️ Ajusta aquí qué tan anchas son las columnas
const COLUMN_WIDTH = SCREEN_WIDTH * 0.65;

/* ========= Helper API: cambio de estado ========= */
async function updateTaskStatus(projectId: number, taskId: number, status: Status) {
  const res = await apiFetch(`/tasks/${projectId}/${taskId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
}


/* ========= Kanban ========= */
export function TaskKanban({ tasks: externalTasks }: { tasks?: Task[] } = {}) {
  const params = useLocalSearchParams();

  // projectId robusto: params (varios nombres) o deducido desde tareas
  const projectId = useMemo<number | null>(() => {
    const candidates = [
      (params as any)?.projectId,
      (params as any)?.id,
      (params as any)?.project?.id,
    ];
    for (const raw of candidates) {
      const v = Array.isArray(raw) ? raw[0] : raw;
      const n = v != null ? Number(v) : NaN;
      if (Number.isFinite(n)) return n;
    }
    if (externalTasks?.length) {
      const fromTask =
        (externalTasks[0] as any)?.projectId ??
        (externalTasks[0] as any)?.project?.id;
      const n = Number(fromTask);
      if (Number.isFinite(n)) return n;
    }
    return null;
  }, [params, externalTasks]);

  const [columns, setColumns] = useState<ColumnsState>({
    created: [],
    in_progress: [],
    completed: [],
    archived: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Estado global del drag
  const [dragging, setDragging] = useState<null | Task>(null);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });

  // Layout de cada columna (en coordenadas absolutas de la pantalla)
  const columnsLayout = useRef<
    Record<Status, { x: number; y: number; width: number; height: number }>
  >({
    created: { x: 0, y: 0, width: 0, height: 0 },
    in_progress: { x: 0, y: 0, width: 0, height: 0 },
    completed: { x: 0, y: 0, width: 0, height: 0 },
    archived: { x: 0, y: 0, width: 0, height: 0 },
  });

  // Refs por columna para poder re-medir bajo demanda
  const columnRefs = {
    created: useRef<View>(null),
    in_progress: useRef<View>(null),
    completed: useRef<View>(null),
    archived: useRef<View>(null),
  };

  const measureAllColumns = useCallback(() => {
    (Object.keys(columnRefs) as Status[]).forEach((s) => {
      const ref = columnRefs[s].current;
      requestAnimationFrame(() => {
        ref?.measureInWindow?.((x, y, w, h) => {
          if (w && h) {
            columnsLayout.current[s] = { x, y, width: w, height: h };
          }
        });
      });
    });
  }, []);

  /* -------- Carga de tareas -------- */
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
      setColumns({ created: [], in_progress: [], completed: [], archived: [] });
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

  // Re-medir cuando cambian columnas (tras pintar)
  useEffect(() => {
    setTimeout(measureAllColumns, 0);
  }, [columns, measureAllColumns]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTasks();
    setRefreshing(false);
  }, [fetchTasks]);

  /* -------- Mover entre columnas (optimista + backend) -------- */
  const handleDrop = useCallback(
  async (task: Task, to: Status) => {
    if ((task.status as any) === to) return;
    const snapshot = columns;

    // UI optimista
    setColumns((prev) => {
      const from: Status = (task.status ?? "created") as Status;
      const src = prev[from].filter((t) => t.id !== task.id);
      const dst = [{ ...task, status: to }, ...prev[to]];
      return { ...prev, [from]: src, [to]: dst };
    });

    try {
      const pid =
        Number((task as any)?.projectId ?? (task as any)?.project?.id) ??
        Number(projectId);
      if (!Number.isFinite(pid)) throw new Error("Falta projectId");

      // ✅ persistir en backend usando /status
      await updateTaskStatus(pid as number, task.id, to);

      // 🔔 notificar lista y detalle
      DeviceEventEmitter.emit(TASK_UPDATED, {
        task: { ...task, status: to, projectId: pid },
      });
    } catch (e: any) {
      // rollback si falla
      setColumns(snapshot);
      Alert.alert("No se pudo actualizar el estado", e?.message ?? "Intenta nuevamente.");
    }
  },
  [columns, projectId]
);


  /* -------- Al soltar: decidir columna destino (con fallback por proximidad) -------- */
  const finishDrop = useCallback(() => {
    if (!dragging) return;
    const { x, y } = dragPos;

    let target: Status | undefined = (Object.keys(columnsLayout.current) as Status[]).find((s) => {
      const r = columnsLayout.current[s];
      return x >= r.x && x <= r.x + r.width && y >= r.y && y <= r.y + r.height;
    });

    if (!target) {
      // elegir la columna más cercana horizontalmente
      const entries = (Object.entries(columnsLayout.current) as [Status, any][])
        .filter(([, r]) => r.width && r.height);
      if (entries.length) {
        entries.sort((a, b) => {
          const ax = a[1].x + a[1].width / 2;
          const bx = b[1].x + b[1].width / 2;
          return Math.abs(ax - x) - Math.abs(bx - x);
        });
        target = entries[0][0];
      }
    }

    if (target) handleDrop(dragging, target);
  }, [dragging, dragPos, handleDrop]);

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
        onMomentumScrollEnd={measureAllColumns}
        onScrollEndDrag={measureAllColumns}
      >
        {STATUS_ORDER.map((status) => (
          <Column
            key={status}
            ref={columnRefs[status]}
            status={status}
            title={STATUS_LABEL[status]}
            color={STATUS_COLOR[status]}
            width={COLUMN_WIDTH}
            onMeasure={(rect) => {
              columnsLayout.current[status] = rect;
            }}
          >
            {errorMsg ? (
              <View style={styles.empty}>
                <Text style={[styles.emptyText, { color: "#d9534f" }]}>{errorMsg}</Text>
              </View>
            ) : columns[status].length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>Soltar aquí</Text>
              </View>
            ) : (
              <ScrollView
                nestedScrollEnabled
                showsVerticalScrollIndicator
                style={{ maxHeight: SCREEN_HEIGHT - 180 }}
                contentContainerStyle={{ paddingBottom: 12 }}
              >
                {columns[status].map((task) => (
                  <DraggableCard
                    key={task.id}
                    task={task}
                    isActive={dragging?.id === task.id}
                    onLongPress={() => setDragging(task)}
                    onMove={({ absoluteX, absoluteY }) => setDragPos({ x: absoluteX, y: absoluteY })}
                    onRelease={() => {
                      setDragging(null);
                      finishDrop();
                    }}
                  >
                    <Text numberOfLines={2} style={styles.cardTitle}>
                      {task.title}
                    </Text>
                    <Text style={styles.cardMeta}>
                      #{task.id} • {task.status ?? "—"}
                    </Text>
                  </DraggableCard>
                ))}
              </ScrollView>
            )}
          </Column>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ========= Column (forwardRef) ========= */
const Column = React.forwardRef<View, {
  status: Status;
  width: number;
  title: string;
  color: string;
  onMeasure: (rect: { x: number; y: number; width: number; height: number }) => void;
  children: React.ReactNode;
}>(function ColumnImpl({ status, width, title, color, onMeasure, children }, ref) {

  const doMeasure = useCallback(() => {
    requestAnimationFrame(() => {
      (ref as React.RefObject<View>)?.current?.measureInWindow?.((x, y, w, h) => {
        onMeasure({ x, y, width: w, height: h });
      });
    });
  }, [onMeasure, ref]);

  return (
    <View ref={ref} onLayout={doMeasure} style={[styles.column, { width }]} collapsable={false}>
      <View style={styles.columnHeader}>
        <View style={[styles.dot, { backgroundColor: color }]} />
        <Text style={styles.columnTitle}>{title}</Text>
      </View>
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
});

/* ========= DraggableCard (Gesture API v3) ========= */
function DraggableCard({
  task,
  isActive,
  onLongPress,
  onMove,
  onRelease,
  children,
}: {
  task: Task;
  isActive: boolean;
  onLongPress: () => void;
  onMove: (p: { absoluteX: number; absoluteY: number }) => void;
  onRelease: () => void;
  children: React.ReactNode;
}) {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);

  const pan = Gesture.Pan()
    .enabled(!!isActive)
    .onUpdate((e) => {
      tx.value = e.translationX;
      ty.value = e.translationY;
      runOnJS(onMove)({ absoluteX: e.absoluteX, absoluteY: e.absoluteY });
    })
    .onEnd(() => {
      tx.value = 0;
      ty.value = 0;
      runOnJS(onRelease)();
    })
    .onFinalize(() => {
      tx.value = 0;
      ty.value = 0;
    });

  const longPress = Gesture.LongPress()
    .minDuration(250)
    .onStart(() => runOnJS(onLongPress)());

  const composed = Gesture.Simultaneous(longPress, pan);

  const styleA = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }],
    zIndex: isActive ? 100 : 1,
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={[styles.card, styleA]} collapsable={false}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}

/* ========= Styles ========= */
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
    backgroundColor: "#fff",
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
