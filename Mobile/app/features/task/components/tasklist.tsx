import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import { DataTable } from "react-native-paper";
import type { Task } from "../types";

interface TaskListProps {
  tasks: Task[];
  sortBy: "title" | "priority" | "dueDate" | null;
  sortDirection: "asc" | "desc";
  onSort: (key: "title" | "priority" | "dueDate") => void;
  onAssign: (taskId: number) => void;
  onTaskPress: (task: Task) => void; // ✅ Cambiado para recibir la tarea completa
}

export function TaskList({ 
  tasks, 
  sortBy, 
  sortDirection, 
  onSort, 
  onAssign, 
  onTaskPress 
}: TaskListProps) {
  const priorityLabels = { high: "Alta", medium: "Media", low: "Baja" };

  return (
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={true}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flex: 1, minWidth: 650 }}>
          <DataTable style={{ backgroundColor: "#fff", borderRadius: 12 }}>
            
            {/* Encabezado */}
            <DataTable.Header>
              <DataTable.Title onPress={() => onSort("title")}>
                <Text>Título {sortBy === "title" ? (sortDirection === "asc" ? "▲" : "▼") : "△"}</Text>
              </DataTable.Title>
              <DataTable.Title>Estado</DataTable.Title>
              <DataTable.Title>Responsable</DataTable.Title>
              <DataTable.Title onPress={() => onSort("dueDate")}>
                <Text>Fecha {sortBy === "dueDate" ? (sortDirection === "asc" ? "▲" : "▼") : "△"}</Text>
              </DataTable.Title>
              <DataTable.Title onPress={() => onSort("priority")}>
                <Text>Prioridad {sortBy === "priority" ? (sortDirection === "asc" ? "▲" : "▼") : "△"}</Text>
              </DataTable.Title>
            </DataTable.Header>

            {tasks.map((t) => (
              <DataTable.Row key={t.id}>
                {/* Celda del título - Ahora es clickeable */}
                <DataTable.Cell style={{ width: 150 }}>
                  <TouchableOpacity 
                    onPress={() => onTaskPress(t)} // ✅ Pasamos la tarea completa
                    style={{ flex: 1 }}
                  >
                    <Text style={{ 
                      fontWeight: "600", 
                      color: "#3B34FF"
                    }}>
                      {t.title}
                    </Text>
                  </TouchableOpacity>
                </DataTable.Cell>

                <DataTable.Cell style={{ width: 100 }}>
                  {t.status ?? "—"}
                </DataTable.Cell>

                <DataTable.Cell style={{ width: 120 }}>
                  <TouchableOpacity onPress={() => onAssign(t.id)}>
                    <Text
                      style={{
                        color: t.assignee?.name ? "#000" : "#3B34FF",
                        fontWeight: t.assignee?.name ? "400" : "600",
                        textAlign: "center",
                      }}
                    >
                      {t.assignee?.name || "Asignar"}
                    </Text>
                  </TouchableOpacity>
                </DataTable.Cell>

                <DataTable.Cell style={{ width: 130 }}>
                  {t.dueDate
                    ? new Date(t.dueDate).toLocaleDateString("es-CL")
                    : "—"}
                </DataTable.Cell>

                <DataTable.Cell style={{ width: 90 }}>
                  <Text
                    style={{
                      color:
                        t.priority === "high"
                          ? "#E74C3C"
                          : t.priority === "medium"
                          ? "#F1C40F"
                          : "#2ECC71",
                      fontWeight: "600",
                    }}
                  >
                    {priorityLabels[t.priority ?? "low"]}
                  </Text>
                </DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        </View>
      </ScrollView>
    </ScrollView>
  );
}