    import React from "react";
    import { View, Text, Switch, TextInput, StyleSheet, TouchableOpacity } from "react-native";
    import type { Task } from "../types";


    interface Filters {
    status: string;
    assignee: string;
    dueDate: string;
    }

    interface Columns {
    status: boolean;
    assignee: boolean;
    dueDate: boolean;
    priority: boolean;
    }

    interface TaskFiltersProps {
    filters: Filters;
    setFilters: React.Dispatch<React.SetStateAction<Filters>>;
    columns: Columns;
    toggleCol: (key: keyof Columns) => void;
    showFilters: boolean;
    setShowFilters: React.Dispatch<React.SetStateAction<boolean>>;
    }

    interface ColSwitchProps {
    label: string;
    value: boolean;
    onChange: () => void;
    }

    export function TaskFilters({
    filters,
    setFilters,
    columns,
    toggleCol,
    showFilters,
    setShowFilters,
    }: TaskFiltersProps) {
    return (
        <View style={styles.wrapper}>


        {showFilters && (
            <View style={styles.container}>
            <ColSwitch label="Estado" value={columns.status} onChange={() => toggleCol("status")} />
            <ColSwitch label="Responsable" value={columns.assignee} onChange={() => toggleCol("assignee")} />
            <ColSwitch label="Fecha límite" value={columns.dueDate} onChange={() => toggleCol("dueDate")} />
            <ColSwitch label="Prioridad" value={columns.priority} onChange={() => toggleCol("priority")} />

            <View style={{ gap: 8, width: "100%", marginTop: 10 }}>
                <Text style={{ fontWeight: "600" }}>Filtros:</Text>

                <Text>Estado:</Text>
                <TextInput
                style={styles.input}
                placeholder="Ej. Pendiente"
                value={filters.status}
                onChangeText={(t) => setFilters({ ...filters, status: t })}
                />

                <Text>Responsable:</Text>
                <TextInput
                style={styles.input}
                placeholder="Ej. Juan"
                value={filters.assignee}
                onChangeText={(t) => setFilters({ ...filters, assignee: t })}
                />

                <Text>Fecha (YYYY-MM-DD):</Text>
                <TextInput
                style={styles.input}
                placeholder="Ej. 2025-10-01"
                value={filters.dueDate}
                onChangeText={(t) => setFilters({ ...filters, dueDate: t })}
                />
            </View>
            </View>
        )}
        </View>
    );
    }


    function ColSwitch({ label, value, onChange }: ColSwitchProps) {
    return (
        <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>{label}</Text>
        <Switch value={value} onValueChange={onChange} />
        </View>
    );
    }

    const styles = StyleSheet.create({
        wrapper: {
        backgroundColor: "#fff",
        marginBottom: 0,
        paddingHorizontal: 0,
        paddingVertical: 0,
    },

    
    container: { flexDirection: "row", flexWrap: "wrap", gap: 10, backgroundColor: "#EFEFFF" },
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
    input: {
        backgroundColor: "#fff",
        padding: 8,
        borderRadius: 8,
        borderColor: "#ccc",
        borderWidth: 1,
        marginBottom: 10,
    },
    });
