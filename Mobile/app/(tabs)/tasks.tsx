import { SafeAreaView, View, Text,Platform , StyleSheet, TouchableOpacity, Switch, ScrollView, TextInput } from "react-native"; 
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Header from "../../components/ui/header";
const PRIMARY = "#3B34FF";
import { useLocalSearchParams } from "expo-router";
import { DataTable } from "react-native-paper";
import React, { useEffect, useMemo, useState } from "react";
import { Animated } from "react-native";
import { logger } from "react-native-reanimated/lib/typescript/common";


interface Task {
  id: number;
  title: string;
  status?: string;
  priority?: string;
  dueDate?: string | null;     
  assignee?: { name?: string | null } | null;
}


type ColumnsState = {
  status: boolean;
  assignee: boolean;
  dueDate: boolean;
  priority: boolean;
};


const defaultColumns: ColumnsState = {
  status: true,
  assignee: true,
  dueDate: true,
  priority: true,
};



export default function TasksScreen() {
  const [showFilters, setShowFilters] = useState(false);
  const router = useRouter();
  const params = useLocalSearchParams();
  const [columns, setColumns] = useState<ColumnsState>(defaultColumns);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const toastY = React.useRef(new Animated.Value(-80)).current; 

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMsg(msg);
    setToastType(type);
    setToastVisible(true);
    
    
    Animated.timing(toastY, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => {

      setTimeout(() => {
        Animated.timing(toastY, { toValue: -80, duration: 180, useNativeDriver: true }).start(
          () => setToastVisible(false)
        );
      }, 1800);
    });
  };

  const toggleCol = (key: keyof ColumnsState) =>
    setColumns((c) => ({ ...c, [key]: !c[key] }));
  
  const projectId = 1; 


  const [tasks, setTasks] = useState<Task[]>([]);
  const [projectName, setProjectName] = useState("");
  

  const [filters, setFilters] = useState({
    status: "",
    assignee: "",
    dueDate: "",
  }); 

  const [sortBy, setSortBy] = useState<"title" | "priority" | "dueDate" | null>(null); 
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc"); 

  const API_BASE = "https://integracion-4.onrender.com";

  useEffect(() => {
    if (!projectId) return;
    
    const fetchTasks = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/tasks/project/${projectId}`);
        const data = await res.json();

        setTasks(data || []);
        setProjectName(data.project?.name || "Proyecto");
        showToast("Tareas cargadas correctamente ", "success");
      } catch (err) {
        console.error("Error al cargar tareas:", err);
        showToast("Error al cargar tareas ", "error");
      }
    };

    fetchTasks();
  }, [projectId]);

  const CL_TZ = "America/Santiago";

  const visibleTasks = useMemo(() => {
    let filtered = tasks.filter((task) => {
      const matchStatus = filters.status
        ? task.status?.toLowerCase().includes(filters.status.toLowerCase())
        : true;

      const matchAssignee = filters.assignee
        ? task.assignee?.name?.toLowerCase().includes(filters.assignee.toLowerCase())
        : true;

      const matchDate = filters.dueDate
        ? task.dueDate?.startsWith(filters.dueDate)
        : true;

      return matchStatus && matchAssignee && matchDate;
    });

    let sorted = [...filtered];

    if (sortBy) {
      sorted.sort((a, b) => {
        let valA: any;
        let valB: any;

        switch (sortBy) {
          case "title":
            valA = a.title?.toLowerCase() || "";
            valB = b.title?.toLowerCase() || "";
            break;

          case "priority":
            const priorityOrder: Record<string, number> = {
              high: 3,
              medium: 2,
              low: 1,
              };
            valA = a.priority && priorityOrder[a.priority] !== undefined ? priorityOrder[a.priority] : 4;
            valB = b.priority && priorityOrder[b.priority] !== undefined ? priorityOrder[b.priority] : 4;
            break;

          case "dueDate":
            valA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
            valB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
            break;
        }

        if (valA < valB) return sortDirection === "asc" ? -1 : 1;
        if (valA > valB) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return sorted;
  }, [tasks, filters, sortBy, sortDirection]); 

  const formatDate = (iso?: string | null) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return new Intl.DateTimeFormat("es-CL", {
      timeZone: CL_TZ,     
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(d);
  };

  const HIDDEN_CELL = { flex: 0 as const, width: 0 as const, paddingHorizontal: 0, opacity: 0 };


  const handleSort = (key: "title" | "priority" | "dueDate") => {
    if (sortBy === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortDirection("asc");
    }
  }; 

  return (
    <SafeAreaView style={styles.container}>
      <Header title={`Tareas de ${projectName}`} />
        {toastVisible && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.toast,
              {
                transform: [{ translateY: toastY }],
                backgroundColor: toastType === "error" ? "#E74C3C" : "#2ECC71",
              },
            ]}
          >
            <Text style={styles.toastText}>{toastMsg}</Text>
          </Animated.View>
        )}

      <View style={styles.filterWrapper}>
        <TouchableOpacity
          onPress={() => setShowFilters(!showFilters)}
          style={styles.toggleFiltersButton}
        >
          <Text style={styles.toggleFiltersText}>
            {showFilters ? "Ocultar filtros ▲" : "Mostrar filtros ▼"}
          </Text>
        </TouchableOpacity>

        {showFilters && (
          <View style={styles.selector}>
            <ColSwitch label="Estado" value={columns.status} onChange={() => toggleCol("status")} />
            <ColSwitch label="Responsable" value={columns.assignee} onChange={() => toggleCol("assignee")} />
            <ColSwitch label="Fecha límite" value={columns.dueDate} onChange={() => toggleCol("dueDate")} />
            <ColSwitch label="Prioridad" value={columns.priority} onChange={() => toggleCol("priority")} />

            <View style={{ gap: 8, width: "100%", marginTop: 10 }}>
              <Text style={{ fontWeight: "600" }}>Filtros:</Text>

              <Text>Estado:</Text>
              <TextInput
                placeholder="Ej. Pendiente"
                style={styles.input}
                value={filters.status}
                onChangeText={(text) => setFilters({ ...filters, status: text })}
              />

              <Text>Responsable:</Text>
              <TextInput
                placeholder="Ej. Juan"
                style={styles.input}
                value={filters.assignee}
                onChangeText={(text) => setFilters({ ...filters, assignee: text })}
              />

              <Text>Fecha (YYYY-MM-DD):</Text>
              <TextInput
                placeholder="Ej. 2025-10-01"
                style={styles.input}
                value={filters.dueDate}
                onChangeText={(text) => setFilters({ ...filters, dueDate: text })}
              />
            </View>

          </View>
        )}
      </View>

      <View style={styles.content}>
        {visibleTasks.length === 0 ? (
          <Text style={{ color: "#666" }}>No hay tareas en este proyecto.</Text>
        ) : (
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <DataTable style={styles.table}>
                <DataTable.Header>

                  <DataTable.Title
                    style={styles.colTitle}
                    onPress={() => handleSort("title")}
                  >
                    Título {sortBy === "title" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
                  </DataTable.Title>

                  <DataTable.Title style={columns.status ? styles.colSmall : HIDDEN_CELL}>Estado</DataTable.Title>
                  <DataTable.Title style={columns.assignee ? styles.colMedium : HIDDEN_CELL}>Responsable</DataTable.Title>

                  <DataTable.Title
                    style={columns.dueDate ? styles.colSmall : HIDDEN_CELL}
                    onPress={() => handleSort("dueDate")}
                  >
                    Fecha {sortBy === "dueDate" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
                  </DataTable.Title>

                  <DataTable.Title
                    style={columns.priority ? styles.colSmall : HIDDEN_CELL}
                    onPress={() => handleSort("priority")}
                  >
                    Prioridad {sortBy === "priority" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
                  </DataTable.Title>

                </DataTable.Header>

                {visibleTasks.map((t: Task) => (
                  <DataTable.Row key={t.id}>
                    <DataTable.Cell style={styles.colTitle}>
                      <Text numberOfLines={2} style={{ fontWeight: "600" }}>{t.title}</Text>
                    </DataTable.Cell>

                    <DataTable.Cell style={columns.status ? styles.colSmall : HIDDEN_CELL}>
                      {t.status ?? "—"}
                    </DataTable.Cell>

                    <DataTable.Cell style={columns.assignee ? styles.colMedium : HIDDEN_CELL}>
                      {t.assignee?.name ?? "—"}
                    </DataTable.Cell>

                    <DataTable.Cell style={columns.dueDate ? styles.colSmall : HIDDEN_CELL}>
                      {formatDate(t.dueDate)}
                    </DataTable.Cell>

                    <DataTable.Cell style={columns.priority ? styles.colSmall : HIDDEN_CELL}>
                      {t.priority ?? "—"}
                    </DataTable.Cell>
                  </DataTable.Row>
                ))}
              </DataTable>
            </ScrollView>
          </ScrollView>
        )}
      </View>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push({ pathname: "/features/task/CreateTask", params: { projectId } })}
        activeOpacity={0.9}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function ColSwitch({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: () => void;
}) {
  return (
        <View style={styles.switchRow}>
      <Text style={styles.switchLabel}>{label}</Text>
      <Switch value={value} onValueChange={onChange} />
      </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PRIMARY,
  },
  content: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#5B55FF",
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    
  },
  selector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingHorizontal: 12,
    paddingTop: 10,
    backgroundColor: "#EFEFFF",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F7F7FF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  switchLabel: { fontSize: 12, color: "#333" },
  table: { backgroundColor: "#fff", borderRadius: 12, overflow: "hidden",minWidth: 600, },
  colTitle: {
    flex: 0,        
    width: 180,    
    paddingHorizontal: 8, 
    paddingVertical: 4, 
  },
  titleText: {
    fontWeight: "600",
    flexWrap: "wrap",  
  },
  colMedium: { flex: 1.4 },
  colSmall: { flex: 1 },
  toast: {
    position: "absolute",
    top: 8,
    left: 16,
    right: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    zIndex: 999,
  },
  toastText: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
  },
  filterWrapper: {
    paddingHorizontal: 12,
    paddingTop: 10,
    backgroundColor: "#EFEFFF",
  },
  toggleFiltersButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#3B34FF",
    borderRadius: 8,
    marginBottom: 8,
  },
  toggleFiltersText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },

  input: {
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 8,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 10,
  }, 
});
