import React from "react";
import { View, Text, Switch, TextInput, StyleSheet } from "react-native";

// 🎨 Hook de tema centralizado
import { useThemedColors } from "@/hooks/use-theme-color";

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
  const {
    BG,
    CARD_BG,
    CARD_BORDER,
    TEXT,
    SUBTEXT,
    INPUT_BG,
    INPUT_BORDER,
    PLACEHOLDER,
  } = useThemedColors();

  return (
    <View style={[styles.wrapper, { backgroundColor: BG }]}>
      {showFilters && (
        <View
          style={[
            styles.container,
            { backgroundColor: CARD_BG, borderColor: CARD_BORDER },
          ]}
        >
          {/* 🔹 Interruptores de columnas */}
          <View style={styles.switchMatrix}>
            <View style={styles.switchRow}>
              <ColSwitch
                label="Estado"
                value={columns.status}
                onChange={() => toggleCol("status")}
                textColor={TEXT}
              />
              <ColSwitch
                label="Responsable"
                value={columns.assignee}
                onChange={() => toggleCol("assignee")}
                textColor={TEXT}
              />
            </View>

            <View style={styles.switchRow}>
              <ColSwitch
                label="Fecha límite"
                value={columns.dueDate}
                onChange={() => toggleCol("dueDate")}
                textColor={TEXT}
              />
              <ColSwitch
                label="Prioridad"
                value={columns.priority}
                onChange={() => toggleCol("priority")}
                textColor={TEXT}
              />
            </View>
          </View>

          {/* 🔹 Campos de filtro */}
          <View style={styles.filtersSection}>
            <Text style={[styles.sectionTitle, { color: TEXT }]}>Filtros:</Text>

            <Text style={[styles.label, { color: SUBTEXT }]}>Estado:</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: INPUT_BG, borderColor: INPUT_BORDER, color: TEXT },
              ]}
              placeholder="Ej. Pendiente"
              placeholderTextColor={PLACEHOLDER}
              value={filters.status}
              onChangeText={(t) => setFilters({ ...filters, status: t })}
            />

            <Text style={[styles.label, { color: SUBTEXT }]}>
              Buscar por etiqueta:
            </Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: INPUT_BG, borderColor: INPUT_BORDER, color: TEXT },
              ]}
              placeholder="Ej. 'Urgente', 'Backend', etc."
              placeholderTextColor={PLACEHOLDER}
              value={filters.tag}
              onChangeText={(t) => setFilters({ ...filters, tag: t })}
            />

            <Text style={[styles.label, { color: SUBTEXT }]}>Responsable:</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: INPUT_BG, borderColor: INPUT_BORDER, color: TEXT },
              ]}
              placeholder="Ej. Juan"
              placeholderTextColor={PLACEHOLDER}
              value={filters.assignee}
              onChangeText={(t) => setFilters({ ...filters, assignee: t })}
            />

            <Text style={[styles.label, { color: SUBTEXT }]}>
              Fecha (YYYY-MM-DD):
            </Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: INPUT_BG, borderColor: INPUT_BORDER, color: TEXT },
              ]}
              placeholder="Ej. 2025-10-01"
              placeholderTextColor={PLACEHOLDER}
              value={filters.dueDate}
              onChangeText={(t) => setFilters({ ...filters, dueDate: t })}
            />
          </View>
        </View>
      )}
    </View>
  );
}

function ColSwitch({
  label,
  value,
  onChange,
  textColor,
}: ColSwitchProps & { textColor: string }) {
  const { CARD_BG, CARD_BORDER } = useThemedColors();

  return (
    <View
      style={[
        styles.colSwitch,
        { backgroundColor: CARD_BG, borderColor: CARD_BORDER, borderWidth: 1 },
      ]}
    >
      <Text style={[styles.switchLabel, { color: textColor }]}>{label}</Text>
      <Switch value={value} onValueChange={onChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 12,
  },
  container: {
    borderRadius: 16,
    borderWidth: 1,
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
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flex: 1,
    marginHorizontal: 4,
  },
  switchLabel: {
    fontSize: 13,
    flex: 1,
    fontWeight: "500",
  },
  filtersSection: {
    marginTop: 10,
  },
  sectionTitle: {
    fontWeight: "700",
    fontSize: 15,
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    fontSize: 14,
  },
});
