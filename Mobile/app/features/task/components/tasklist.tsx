import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import { DataTable } from "react-native-paper";
import type { Task } from "../types";
import { useThemedColors } from "@/hooks/use-theme-color";

interface TaskListProps {
  tasks: Task[];
  sortBy: "title" | "priority" | "dueDate" | null;
  sortDirection: "asc" | "desc";
  onSort: (key: "title" | "priority" | "dueDate") => void;
  onAssign: (taskId: number) => void;
  onTaskPress: (task: Task) => void;
}

export function TaskList({
  tasks,
  sortBy,
  sortDirection,
  onSort,
  onAssign,
  onTaskPress,
}: TaskListProps) {
  const { BG, TEXT, BRAND, CARD_BG, CARD_BORDER } = useThemedColors();

  const priorityLabels: Record<string, string> = { high: "Alta", medium: "Media", low: "Baja" };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: BG }} showsVerticalScrollIndicator>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flex: 1, minWidth: 650 }}>
          <DataTable style={{ backgroundColor: CARD_BG, borderRadius: 12, borderWidth: 1, borderColor: CARD_BORDER }}>
            {/* Encabezado */}
            <DataTable.Header>
              <DataTable.Title onPress={() => onSort("title")}>
                <Text style={{ color: TEXT }}>
                  Título {sortBy === "title" ? (sortDirection === "asc" ? "▲" : "▼") : "△"}
                </Text>
              </DataTable.Title>
              <DataTable.Title>
                <Text style={{ color: TEXT }}>Estado</Text>
              </DataTable.Title>
              <DataTable.Title>
                <Text style={{ color: TEXT }}>Responsable</Text>
              </DataTable.Title>
              <DataTable.Title onPress={() => onSort("dueDate")}>
                <Text style={{ color: TEXT }}>
                  Fecha {sortBy === "dueDate" ? (sortDirection === "asc" ? "▲" : "▼") : "△"}
                </Text>
              </DataTable.Title>
              <DataTable.Title onPress={() => onSort("priority")}>
                <Text style={{ color: TEXT }}>
                  Prioridad {sortBy === "priority" ? (sortDirection === "asc" ? "▲" : "▼") : "△"}
                </Text>
              </DataTable.Title>
            </DataTable.Header>

            {tasks.map((t) => (
              <DataTable.Row key={t.id}>
                {/* Celda del título */}
                <DataTable.Cell style={{ width: 150 }}>
                  <TouchableOpacity onPress={() => onTaskPress(t)} style={{ flex: 1 }}>
                    <Text style={{ fontWeight: "600", color: BRAND }}>
                      {t.title}
                    </Text>

                    {/* etiquetas */}
                    {t.tags && t.tags.length > 0 && (
                      <View
                        style={{
                          flexDirection: "row",
                          flexWrap: "wrap",
                          marginTop: 4,
                          gap: 4,
                        }}
                      >
                        {t.tags.map(({ tag }) => (
                          <View
                            key={tag.id}
                            style={{
                              backgroundColor: tag.color || "#EAE8FF",
                              borderRadius: 12,
                              paddingHorizontal: 8,
                              paddingVertical: 3,
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Text
                              style={{
                                color: "#FFF",
                                fontSize: 11,
                                fontWeight: "500",
                              }}
                            >
                              {tag.name}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </TouchableOpacity>
                </DataTable.Cell>

                <DataTable.Cell style={{ width: 100 }}>
                  <Text style={{ color: TEXT }}>{t.status ?? "—"}</Text>
                </DataTable.Cell>

                <DataTable.Cell style={{ width: 120 }}>
                  <TouchableOpacity onPress={() => onAssign(t.id)}>
                    <Text
                      style={{
                        color: t.assignee?.name ? TEXT : BRAND,
                        fontWeight: t.assignee?.name ? "400" : "600",
                        textAlign: "center",
                      }}
                    >
                      {t.assignee?.name || "Asignar"}
                    </Text>
                  </TouchableOpacity>
                </DataTable.Cell>

                <DataTable.Cell style={{ width: 130 }}>
                  <Text style={{ color: TEXT }}>
                    {t.dueDate ? t.dueDate.split("T")[0].replace(/-/g, "/") : "—"}
                  </Text>
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
