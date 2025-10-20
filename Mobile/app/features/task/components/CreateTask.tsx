import React, { useState } from "react";
import {
  SafeAreaView, View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { getAccessToken } from "@/lib/secure-store";
import { apiFetch } from "@/lib/api-fetch";

// 🎨 Hook de colores centralizado (dark mode)
import { useThemedColors } from "@/hooks/use-theme-color";

const priorityMap: Record<"Alta" | "Media" | "Baja", "high" | "medium" | "low"> = {
  Alta: "high",
  Media: "medium",
  Baja: "low",
};

function clean<T extends object>(obj: T): Partial<T> {
  const out: any = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    if (typeof v === "string" && v.trim() === "") continue;
    out[k] = v;
  }
  return out;
}

function normalizeDate(dateStr?: string) {
  if (!dateStr) return null;
  const cleaned = dateStr.replace(/[^\d]/g, "");
  if (cleaned.length !== 8) return null;
  const y = cleaned.slice(0, 4);
  const m = cleaned.slice(4, 6);
  const d = cleaned.slice(6, 8);
  return `${y}-${m}-${d}`;
}

function isValidDate(dateStr: string) {
  const norm = normalizeDate(dateStr);
  if (!norm) return false;

  const [y, m, d] = norm.split("-").map(Number);
  if (m < 1 || m > 12) return false;

  const daysInMonth = [31, (y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (d < 1 || d > daysInMonth[m - 1]) return false;

  const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() + 1 === m && dt.getDate() === d;
}

function toISODateTime(dateStr?: string) {
  const norm = normalizeDate(dateStr);
  if (!norm) return undefined;
  return norm;
}

export default function NewTaskScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ projectId?: string; creatorId?: string }>();

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState("");
  const [priority, setPriority] = useState<"Alta" | "Media" | "Baja">("Media");
  const [tag, setTag] = useState("");

  const canSave = title.trim().length > 0;

  // 🎨 Tokens del tema
  const {
    BG,
    TEXT,
    SUBTEXT,
    BRAND,           // usa #0a7ea4 como fallback
    CARD_BG,
    CARD_BORDER,
    INPUT_BG,
    INPUT_BORDER,
    PLACEHOLDER,
  } = useThemedColors();

  const submit = async () => {
    if (!canSave) {
      return Alert.alert("Falta título", "El título es obligatorio.");
    }

    const token = await getAccessToken();
    if (!token) {
      Alert.alert("Error", "No hay token de acceso. Inicia sesión nuevamente.");
      return;
    }

    const projectId = Number(params.projectId);
    const creatorId = Number(params.creatorId);

    if (!projectId || !creatorId) {
      Alert.alert("Error", "Faltan los IDs de proyecto o usuario.");
      return;
    }

    const payload = clean({
      title,
      description: desc,
      dueDate: normalizeDate(date),
      priority: priorityMap[priority],
      projectId,
      creatorId,
    });

    if (!isValidDate(date)) {
      Alert.alert("Fecha inválida", "Usa el formato YYYY-MM-DD.");
      return;
    }

    try {
      const res = await apiFetch(`/tasks/${projectId}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const raw = await res.text();
      if (!res.ok) throw new Error(`Error ${res.status}: ${raw}`);

      Alert.alert("Éxito", "Tarea creada correctamente.");
      router.back();
    } catch (err) {
      console.error("❌ Error al crear tarea:", err);
      Alert.alert("Error", "No se pudo crear la tarea. Verifica los datos o el token.");
    }
  };

  const handleDateChange = (text: string) => {
    const cleaned = text.replace(/[^\d]/g, "");
    let formatted = cleaned;
    if (cleaned.length > 4 && cleaned.length <= 6) {
      formatted = `${cleaned.slice(0, 4)}/${cleaned.slice(4)}`;
    } else if (cleaned.length > 6) {
      formatted = `${cleaned.slice(0, 4)}/${cleaned.slice(4, 6)}/${cleaned.slice(6, 8)}`;
    }
    setDate(formatted);
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: BRAND }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nueva tarea</Text>
        <View style={{ width: 32 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View
          style={[
            styles.card,
            { backgroundColor: CARD_BG, borderTopLeftRadius: 24, borderTopRightRadius: 24, borderColor: CARD_BORDER, borderWidth: 1 },
          ]}
        >
          <Text style={[styles.label, { color: TEXT }]}>Título</Text>
          <TextInput
            placeholder="Diseñar interfaz"
            placeholderTextColor={PLACEHOLDER}
            value={title}
            onChangeText={setTitle}
            style={[
              styles.input,
              { backgroundColor: INPUT_BG, borderColor: INPUT_BORDER, color: TEXT },
            ]}
          />

          <Text style={[styles.label, { color: TEXT }]}>Descripción</Text>
          <TextInput
            placeholder="Detalles…"
            placeholderTextColor={PLACEHOLDER}
            value={desc}
            onChangeText={setDesc}
            style={[
              styles.input,
              { height: 90, textAlignVertical: "top", backgroundColor: INPUT_BG, borderColor: INPUT_BORDER, color: TEXT },
            ]}
            multiline
          />

          <Text style={[styles.label, { color: TEXT }]}>Fecha</Text>
          <TextInput
            placeholder="YYYY/MM/DD"
            placeholderTextColor={PLACEHOLDER}
            value={date}
            onChangeText={handleDateChange}
            keyboardType="numeric"
            maxLength={10}
            style={[
              styles.input,
              { backgroundColor: INPUT_BG, borderColor: INPUT_BORDER, color: TEXT },
            ]}
          />

          <Text style={[styles.label, { color: TEXT }]}>Prioridad</Text>
          <View style={styles.priorityRow}>
            {(["Alta", "Media", "Baja"] as const).map((p) => {
              const active = p === priority;
              return (
                <TouchableOpacity
                  key={p}
                  onPress={() => setPriority(p)}
                  style={[
                    styles.chip,
                    { borderColor: BRAND, backgroundColor: "transparent" },
                    active && { backgroundColor: BRAND },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: BRAND },
                      active && { color: "#fff" },
                    ]}
                  >
                    {p}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.label, { color: TEXT }]}>Etiqueta</Text>
          <TextInput
            placeholder="UI, Backend, Bug… (no se envía)"
            placeholderTextColor={PLACEHOLDER}
            value={tag}
            onChangeText={setTag}
            style={[
              styles.input,
              { backgroundColor: INPUT_BG, borderColor: INPUT_BORDER, color: TEXT },
            ]}
          />

          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: BRAND }, !canSave && { opacity: 0.5 }]}
            disabled={!canSave}
            onPress={submit}
          >
            <Text style={styles.primaryBtnText}>Crear tarea</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "700" },
  backBtn: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },

  card: {
    flex: 1,
    padding: 16,
    gap: 10,
  },
  label: { fontWeight: "600", marginTop: 4 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },

  priorityRow: { flexDirection: "row", gap: 8, marginBottom: 4 },
  chip: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  chipText: { fontWeight: "600" },

  primaryBtn: {
    marginTop: 12,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
