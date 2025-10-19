    import React from "react";
    import { View, Text, Switch, TextInput, StyleSheet } from "react-native";

    interface Filters {
    status: string;
    assignee: string;
    dueDate: string;
    search: string;
    tag: string;
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
    }: TaskFiltersProps) {
    return (
        <View style={styles.wrapper}>
        {showFilters && (
            <View style={styles.container}>
            {/* 🔹 Interruptores de columnas en formato de matriz */}
            <View style={styles.switchMatrix}>
                <View style={styles.switchRow}>
                <ColSwitch
                    label="Estado"
                    value={columns.status}
                    onChange={() => toggleCol("status")}
                />
                <ColSwitch
                    label="Responsable"
                    value={columns.assignee}
                    onChange={() => toggleCol("assignee")}
                />
                </View>

                <View style={styles.switchRow}>
                <ColSwitch
                    label="Fecha límite"
                    value={columns.dueDate}
                    onChange={() => toggleCol("dueDate")}
                />
                <ColSwitch
                    label="Prioridad"
                    value={columns.priority}
                    onChange={() => toggleCol("priority")}
                />
                </View>
            </View>

            {/* 🔹 Campos de filtro */}
            <View style={styles.filtersSection}>
                <Text style={styles.sectionTitle}>Filtros:</Text>

                <Text style={styles.label}>Estado:</Text>
                <TextInput
                style={styles.input}
                placeholder="Ej. Pendiente"
                value={filters.status}
                onChangeText={(t) => setFilters({ ...filters, status: t })}
                />

                <Text style={styles.label}>Buscar por etiqueta:</Text>
                <TextInput
                style={styles.input}
                placeholder="Ej. 'Urgente', 'Backend', etc."
                value={filters.tag}
                onChangeText={(t) => setFilters({ ...filters, tag: t })}
                />

                <Text style={styles.label}>Responsable:</Text>
                <TextInput
                style={styles.input}
                placeholder="Ej. Juan"
                value={filters.assignee}
                onChangeText={(t) => setFilters({ ...filters, assignee: t })}
                />

                <Text style={styles.label}>Fecha (YYYY-MM-DD):</Text>
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
        <View style={styles.colSwitch}>
        <Text style={styles.switchLabel}>{label}</Text>
        <Switch value={value} onValueChange={onChange} />
        </View>
    );
    }

    const styles = StyleSheet.create({
    wrapper: {
        backgroundColor: "#fff",
        marginBottom: 12,
    },

    container: {
        backgroundColor: "#EFF2F7", 
        borderRadius: 16, 
        borderWidth: 0.4,
        borderColor: "#000",
        padding: 16,
        marginTop: 8,
    },

    switchMatrix: {
        width: "100%",
        marginBottom: 12,
    },

    switchRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
    },

    colSwitch: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F8F9FC",
        borderRadius: 10,

        paddingHorizontal: 10,
        paddingVertical: 6,
        flex: 1,
        marginHorizontal: 4,
    },

    switchLabel: {
        fontSize: 13,
        color: "#000",
        flex: 1,
        fontWeight: "500",
    },

    filtersSection: {
        marginTop: 10,
    },

    sectionTitle: {
        fontWeight: "700",
        fontSize: 15,
        color: "#000",
        marginBottom: 6,
    },

    label: {
        fontSize: 13,
        fontWeight: "500",
        color: "#333",
        marginBottom: 4,
    },

    input: {
        backgroundColor: "#fff",
        padding: 10,
        borderRadius: 10,


        marginBottom: 10,
    },
    });

