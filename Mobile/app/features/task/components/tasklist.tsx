    import { ScrollView, View, Text, TouchableOpacity } from "react-native";
    import { DataTable } from "react-native-paper";
    import type { Task } from "../types";

    interface TaskListProps {
    tasks: Task[];
    sortBy: "title" | "priority" | "dueDate" | null;
    sortDirection: "asc" | "desc";
    onSort: (key: "title" | "priority" | "dueDate") => void;
    onAssign: (taskId: number) => void;
    }

    export function TaskList({ tasks, sortBy, sortDirection, onSort, onAssign }: TaskListProps) {
    const priorityLabels = { high: "Alta", medium: "Media", low: "Baja" };

    return (
    
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={true}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flex: 1, minWidth: 700 }}>
            <DataTable style={{ backgroundColor: "#fff", borderRadius: 12 }}>

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
                <DataTable.Title>Acciones</DataTable.Title>
                </DataTable.Header>


                {tasks.map((t) => (
                <DataTable.Row key={t.id}>
                    <DataTable.Cell style={{ width: 150 }}>
                    <Text style={{ fontWeight: "600" }}>{t.title}</Text>
                    </DataTable.Cell>
                    <DataTable.Cell style={{ width: 100 }}>{t.status ?? "—"}</DataTable.Cell>
                    <DataTable.Cell style={{ width: 120 }}>{t.assignee?.name ?? "—"}</DataTable.Cell>
                    <DataTable.Cell style={{ width: 130 }}>
                    {t.dueDate ? new Date(t.dueDate).toLocaleDateString("es-CL") : "—"}
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
                    <DataTable.Cell style={{ width: 100 }}>
                    <TouchableOpacity
                        onPress={() => onAssign(t.id)}
                        style={{
                        backgroundColor: "#3B34FF",
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 6,
                        }}
                    >
                        <Text style={{ color: "#fff" }}>Asignar</Text>
                    </TouchableOpacity>
                    </DataTable.Cell>
                </DataTable.Row>
                ))}
            </DataTable>
            </View>
        </ScrollView>
        </ScrollView>
    );
    }
