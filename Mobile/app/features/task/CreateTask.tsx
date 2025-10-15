import React, { useState } from "react";
import {
  SafeAreaView, View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { getAccessToken } from "@/lib/secure-store";
  import { apiFetch } from "@/lib/api-fetch";

const PRIMARY = "#3B34FF";



const priorityMap: Record<"Alta" | "Media" | "Baja", "high" | "medium" | "low"> = {
  Alta: "high",
  Media: "medium",
  Baja: "low",
};



function toISODateTime(d?: string) {
  if (!d) return undefined as unknown as string;
  const [y, m, dd] = d.split("-");
  if (!y || !m || !dd) return undefined as unknown as string;
  return `${y.padStart(4, "0")}-${m.padStart(2, "0")}-${dd.padStart(2, "0")}T00:00:00.000Z`;
}

function clean<T extends object>(obj: T): Partial<T> {
  const out: any = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    if (typeof v === "string" && v.trim() === "") continue;
    out[k] = v;
  }
  return out;
}






const BASE_URL = "https://integracion-4.onrender.com";

function isValidDate(dateStr: string) {
  if (!dateStr) return false;
  
  const s = String(dateStr).trim().replace(/\u2010|\u2011|\u2012|\u2013|\u2014/g, '-');
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(s)) return false;

  const [year, month, day] = s.split('-').map(Number);
  
  const d = new Date(Date.UTC(year, month - 1, day));
  return d.getUTCFullYear() === year && d.getUTCMonth() + 1 === month && d.getUTCDate() === day;
}



export default function NewTaskScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ projectId?: string; creatorId?: string }>(); // --> EXTRAE PARAMETROS DE LA URL 

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState("");
  const [priority, setPriority] = useState<"Alta" | "Media" | "Baja">("Media");
  const [tag, setTag] = useState(""); 

  const canSave = title.trim().length > 0; 



  

const submit = async () => {
  if (!canSave) {
    return Alert.alert("Falta título", "El título es obligatorio.");
  }



  const token = await getAccessToken();

  if (!token) {
    Alert.alert("Error", "No hay token de acceso. Inicia sesión nuevamente.");
    return;
  }

  const payload = clean({
  title,
  description: desc,
  dueDate: toISODateTime(date),
  priority: priorityMap[priority],
  projectId: 1,  
  creatorId: 1,  
});

  try {



  const res = await apiFetch(`/api/tasks/1`, {
      method: "POST",
      headers: {
      "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
  });


    console.log("🧪 Status:", res.status);
    const raw = await res.text();
    console.log("🧪 Raw response:", raw);

    if (!res.ok) {
      throw new Error(`Error ${res.status}: ${raw}`);
    }

    const data = JSON.parse(raw);
    Alert.alert("Éxito", "Tarea creada correctamente.");
    router.back();
  } catch (err) {
    console.error("❌ Error al crear tarea:", err);
    Alert.alert("Error", "No se pudo crear la tarea. Verifica los datos o el token.");
  }
};


  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nueva tarea</Text>
        <View style={{ width: 32 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.card}>
          <Text style={styles.label}>Título</Text>
          <TextInput
            placeholder="Diseñar interfaz"
            placeholderTextColor="#9aa0a6"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
          />

          <Text style={styles.label}>Descripción</Text>
          <TextInput
            placeholder="Detalles…"
            placeholderTextColor="#9aa0a6"
            value={desc}
            onChangeText={setDesc}
            style={[styles.input, { height: 90, textAlignVertical: "top" }]}
            multiline
          />

          <Text style={styles.label}>Fecha</Text>
          <TextInput
            placeholder="2025-10-01"
            placeholderTextColor="#9aa0a6"
            value={date}
            onChangeText={setDate}
            style={styles.input}
          />

          <Text style={styles.label}>Prioridad</Text>
          <View style={styles.priorityRow}>
            {(["Alta", "Media", "Baja"] as const).map((p) => {
              const active = p === priority;
              return (
                <TouchableOpacity key={p} onPress={() => setPriority(p)} style={[styles.chip, active && styles.chipActive]}>
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{p}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>Etiqueta</Text>
          <TextInput
            placeholder="UI, Backend, Bug… (no se envía)"
            placeholderTextColor="#9aa0a6"
            value={tag}
            onChangeText={setTag}
            style={styles.input}
          />

          <TouchableOpacity
            style={[styles.primaryBtn, !canSave && { opacity: 0.5 }]}
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
  root: { flex: 1, backgroundColor: PRIMARY },
  header: {
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "700" },
  backBtn: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },

  card: {
    flex: 1, backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 16, gap: 10,
  },
  label: { color: "#4a4a4a", fontWeight: "600", marginTop: 4 },
  input: {
    borderWidth: 1, borderColor: "#E3E5EA", backgroundColor: "#F7F8FA",
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: "#111",
  },
  priorityRow: { flexDirection: "row", gap: 8, marginBottom: 4 },
  chip: {
    borderWidth: 1, borderColor: "#d7daf5", backgroundColor: "#F5F6FF",
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999,
  },
  chipActive: { backgroundColor: "#5B55FF", borderColor: "#5B55FF" },
  chipText: { color: "#5B55FF", fontWeight: "600" },
  chipTextActive: { color: "#fff" },

  primaryBtn: {
    marginTop: 12, backgroundColor: "#5B55FF", borderRadius: 14,
    alignItems: "center", justifyContent: "center", paddingVertical: 14,
    elevation: 3, shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 6, shadowOffset: { width: 0, height: 3 },
  },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
