import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Alert,
  DeviceEventEmitter,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getAccessToken } from '@/lib/secure-store';
import { apiFetch } from '@/lib/api-fetch';
import { AssignModal } from './components/assignmodal';
import { useThemedColors } from '@/hooks/use-theme-color';
import LayoutContainer from '@/components/layout/layout_container';
import { CONTAINER } from '@/constants/spacing';
import Input from '@/components/ui/input';
import Button from '@/components/ui/button';

const TASK_UPDATED = 'TASK_UPDATED';

export default function DetailTask() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const taskId = Array.isArray(params.taskId) ? params.taskId[0] : params.taskId;
  const taskDataParam = Array.isArray(params.taskData) ? params.taskData[0] : params.taskData;

  const [task, setTask] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modo edición local
  const [editing, setEditing] = useState(false);
  const [editState, setEditState] = useState<any>({});

  // Refs (enfoque)
  const titleRef = useRef<any>(null);
  const descRef = useRef<any>(null);

  // Modales
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);

  // Asignación
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [projectMembers, setProjectMembers] = useState<Array<{ id: number; name: string }>>([]);

  // Edición de fecha (formato mostrado)
  const [dueDateEditingValue, setDueDateEditingValue] = useState<string | null>(null);

    // --- Etiquetas ---
  const [projectTags, setProjectTags] = useState<{ id: number; name: string }[]>([]);
  const [selectedTag, setSelectedTag] = useState<any>(null);
  const [showTagPicker, setShowTagPicker] = useState(false);


  const TAG_COLORS = [
    "#FFD6A5", // naranja claro
    "#CAFFBF", // verde menta
    "#A0C4FF", // azul suave
    "#BDB2FF", // violeta claro
    "#FFC6FF", // rosado

  ];


  const getTagColor = (id: number) => TAG_COLORS[id % TAG_COLORS.length];



  useEffect(() => {
    const projectId = task?.projectId ?? task?.project?.id;
    if (!projectId) return;

    (async () => {
      try {
        const token = await getAccessToken();
        const res = await apiFetch(`/tags/project/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setProjectTags(data);
      } catch (err) {
        console.error("Error cargando etiquetas:", err);
      }
    })();
  }, [task]);



useEffect(() => {
  if (!taskId) return;

  (async () => {
    try {
      const token = await getAccessToken();
      const res = await apiFetch(`/tags/task/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();


      const normalized =
        Array.isArray(data) && data.length > 0 && data[0].tag
          ? data.map((t: any) => t.tag)
          : data;

      setTask((prev: any) => ({ ...prev, tags: normalized }));
    } catch (err) {
      console.error("Error cargando etiquetas de la tarea:", err);
    }
  })();
}, [taskId]);

  // 🎨 tokens del tema
  const {
    isDark,
    BG,
    TEXT,
    SUBTEXT,
    BRAND,
    CARD_BG,
    CARD_BORDER,
    INPUT_BORDER,
    MUTED_BG,
    PLACEHOLDER,
  } = useThemedColors();

  // Traducciones y helpers
  const statusMap: Record<string, string> = {
    created: 'Creada',
    in_progress: 'En progreso',
    completed: 'Completada',
    archived: 'Archivada',
  };
  const priorityMap: Record<string, string> = {
    high: 'Alta',
    medium: 'Media',
    low: 'Baja',
  };

  const assignTagToTask = async (tagId: number) => {
    if (!taskId) return;
    try {
      const token = await getAccessToken();

      const res = await apiFetch(`/tags/assign`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ taskId: Number(taskId), tagId: Number(tagId) }),
      });

      if (!res.ok) throw new Error(await res.text());

      const selected = projectTags.find((t) => t.id === tagId);


      setTask((prev: any) => ({
        ...prev,
        tags: prev?.tags ? [...prev.tags, selected] : [selected],
      }));

      setSelectedTag(selected);
      setShowTagPicker(false);

      Alert.alert("Etiqueta asignada", `Se asignó "${selected?.name}"`);
    } catch (err: any) {
      const errorMsg = err?.message || "";

      if (
        errorMsg.includes("Unique constraint failed") ||
        errorMsg.includes("taskId','tagId")
      ) {
        Alert.alert(
          "Etiqueta ya asignada",
          "Esta tarea ya tiene esa etiqueta asignada."
        );
      } else {
        console.error("Error asignando etiqueta:", err);
        Alert.alert("Error", "No se pudo asignar la etiqueta. Intenta nuevamente.");
      }
    }
  };


  
  const removeTagFromTask = async (tagId?: number) => {
    if (!taskId || !tagId) return;

    Alert.alert("Quitar etiqueta", "¿Deseas eliminar esta etiqueta?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await getAccessToken();
          
            const res = await apiFetch(`/tags/remove/${taskId}/${tagId}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
              const txt = await res.text();
              throw new Error(txt || "Error al eliminar etiqueta");
            }

          
            setTask((prev: any) => ({
              ...prev,
              tags: prev.tags.filter((t: any) => t.id !== tagId),
            }));

            Alert.alert("Etiqueta eliminada", "La etiqueta fue eliminada correctamente.");
          } catch (err) {
            console.error("Error eliminando etiqueta:", err);
            Alert.alert("Error", "No se pudo eliminar la etiqueta.");
          }
        },
      },
    ]);
  };



  // Date helpers: formato YYYY/MM/DD
  const displayDateFromISO = (iso?: string | null) =>
    iso ? String(iso).slice(0, 10).replace(/-/g, '/') : '';
  const parseDisplayDateToISO = (input: string) => {
    const raw = String(input || '').trim();
    if (!raw) return null;
    const cleaned = raw.replace(/\//g, '-');
    const parts = cleaned.split('-');
    if (parts.length === 3) {
      const y = parts[0].padStart(4, '0');
      const m = parts[1].padStart(2, '0');
      const d = parts[2].padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    const dt = new Date(raw);
    if (!isNaN(dt.getTime())) return dt.toISOString().slice(0, 10);
    return raw;
  };
  const normalize = (v: any) => String(v ?? '').toLowerCase().trim().replace(/\s+/g, '_');
  const t = (map: Record<string, string>, v: any) => map[normalize(v)] ?? (v ?? '—');

  const STATUS_OPTIONS = ['created', 'in_progress', 'completed', 'archived'];
  const PRIORITY_OPTIONS = ['high', 'medium', 'low'];

  const apiFetchWithFormData = async (url: string, options: any = {}) => {
    const token = await getAccessToken();
    const headers = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };
    if (options.body instanceof FormData) delete (headers as any)['Content-Type'];
    return apiFetch(url, { ...options, headers });
  };

  // Cargar datos iniciales
  useEffect(() => {
    if (!taskDataParam) return;
    setLoading(true);
    try {
      const parsedTask = JSON.parse(taskDataParam);
      const correctedTask = {
        ...parsedTask,
        title: parsedTask.tile || parsedTask.title,
        status: parsedTask._status || parsedTask.status,
        assigneeId: parsedTask.assigneeld || parsedTask.assigneeId,
      };
      setTask(correctedTask);
      setEditState({
        title: correctedTask.title,
        description: correctedTask.description,
        status: correctedTask.status,
        priority: correctedTask.priority,
        dueDate: correctedTask.dueDate,
        assigneeId: correctedTask.assigneeId,
      });
    } catch (e: any) {
      console.error('detail fetch error', e);
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }, [taskDataParam]);

  // 🔔 Sincroniza status desde Kanban
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener(TASK_UPDATED, ({ task: updated }: any) => {
      const idActual = Number(taskId);
      if (updated && Number(updated.id) === idActual) {
        setTask((prev: any) => (prev ? { ...prev, status: updated.status } : prev));
        setEditState((prev: any) => ({ ...(prev ?? {}), status: updated.status }));
      }
    });
    return () => sub.remove();
  }, [taskId]);



  function emitTaskUpdated(updated: any) {
    DeviceEventEmitter.emit(TASK_UPDATED, { task: updated });
  }

  // Cambiar SOLO status
  async function updateTaskStatusOnly(id: string | number, newStatus: string) {
    try {
      const projectId = (task as any)?.projectId ?? (task as any)?.project?.id;
      if (!projectId) throw new Error('Falta projectId en la tarea.');

      setTask((prev: any) => (prev ? { ...prev, status: newStatus } : prev));
      setEditState((prev: any) => ({ ...(prev ?? {}), status: newStatus }));

      const res = await apiFetch(`/tasks/${projectId}/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const text = await res.text();
      if (!res.ok) throw new Error(text || `HTTP ${res.status}`);

      const serverTask = text ? JSON.parse(text) : { ...(task ?? {}), status: newStatus };

      setTask(serverTask);
      setEditState((prev: any) => ({ ...(prev ?? {}), status: serverTask.status }));
      emitTaskUpdated({ ...(task ?? {}), id, status: serverTask.status, projectId });
    } catch (err) {
      setTask((prev: any) => (prev ? { ...prev, status: (task as any)?.status } : prev));
      setEditState((prev: any) => ({ ...(prev ?? {}), status: (task as any)?.status }));
      Alert.alert('No se pudo actualizar el estado', (err as any)?.message ?? 'Intenta nuevamente.');
      throw err;
    }
  }

  // Persistencia PUT
  async function persistTaskPatch(id: string | number, patch: Partial<any>) {
    setTask((prev: any) => (prev ? { ...prev, ...patch } : prev));
    setEditState((prev: any) => ({ ...prev, ...patch }));
    try {
      const projectId = (task as any)?.projectId ?? (task as any)?.project?.id;
      if (!projectId) throw new Error('Falta projectId en la tarea.');

      const allowed = ['title', 'description', 'dueDate', 'assigneeId', 'status', 'priority'];
      const base = { ...(task ?? {}), ...patch } as any;
      const payload: any = {};
      for (const k of allowed) {
        let v = base[k];
        if (v === null || v === undefined) continue;
        if (k === 'assigneeId') {
          if (v === '') continue;
          if (typeof v === 'string') {
            const n = Number(v);
            if (!Number.isFinite(n)) continue;
            v = n;
          }
        }
        if (typeof v === 'string' && v.trim() === '') continue;
        payload[k] = v;
      }

      const res = await apiFetch(`/tasks/projects/${projectId}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      if (!res.ok) {
        if (text && /^\s*<!DOCTYPE html>/i.test(text)) throw new Error('La URL de API devolvió HTML');
        throw new Error(text || `HTTP ${res.status}`);
      }

      const serverTask = text ? JSON.parse(text) : { ...(task ?? {}), ...patch };
      setTask(serverTask);
      emitTaskUpdated(serverTask);
    } catch (err: any) {
      console.error('Persist error:', err);
      Alert.alert('No se pudo guardar', err?.message ?? 'Intenta nuevamente.');
    }
  }

  const saveEdits = async () => {
    if (!taskId || !task) return;
    const patch: any = {};
    const normalizeDateForCompare = (v: any) => {
      if (v === null || v === undefined) return '';
      const s = String(v).trim();
      if (!s) return '';
      const iso = parseDisplayDateToISO(s);
      return iso ? iso : s;
    };

    ['title', 'description', 'status', 'priority', 'assigneeId'].forEach((k) => {
      if (editState[k] !== (task as any)[k]) patch[k] = editState[k];
    });
    const editDue = normalizeDateForCompare(editState.dueDate);
    const taskDue = normalizeDateForCompare((task as any).dueDate);
    if (editDue !== taskDue) patch.dueDate = editDue === '' ? null : editDue;

    if (Object.keys(patch).length === 0) {
      setEditing(false);
      return;
    }

    if (patch.status !== undefined) {
      try {
        await updateTaskStatusOnly(taskId, patch.status);
      } catch (e: any) {
        setTask((prev: any) => (prev ? { ...prev, status: (task as any)?.status } : prev));
        setEditState((prev: any) => ({ ...(prev ?? {}), status: (task as any)?.status }));
        Alert.alert('No se pudo actualizar el estado', e?.message ?? 'Intenta nuevamente.');
        delete patch.status;
      }
      if (patch.status !== undefined) delete patch.status;
    }

    if (Object.keys(patch).length > 0) await persistTaskPatch(taskId, patch);
    setEditing(false);
  };


  const startEditTitle = () => {
    setEditing(true);
    setTimeout(() => titleRef.current?.focus(), 0);
  };
  
  const startEditDescription = () => {
    setEditing(true);
    setTimeout(() => descRef.current?.focus(), 0);
  };

  const onTitleEndEditing = () => {
    if (!taskId || !task) return;
    if (editState.title !== task.title) persistTaskPatch(taskId, { title: editState.title });
  };

  const onDescriptionEndEditing = () => {
    if (!taskId || !task) return;
    if (editState.description !== task.description)
    persistTaskPatch(taskId, { description: editState.description });
  };

  const onPickStatus = (value: string) => {
    setShowStatusPicker(false);
    setEditing(true);
    setEditState((s: any) => ({ ...s, status: value }));
    if (taskId) updateTaskStatusOnly(taskId, value).catch(() => {});
  };
  const onPickPriority = (value: string) => {
    setShowPriorityPicker(false);
    setEditing(true);
    setEditState((s: any) => ({ ...s, priority: value }));
    if (taskId) persistTaskPatch(taskId, { priority: value });
  };


  if (!taskId)
    return (
      <LayoutContainer scroll={false} style={{ backgroundColor: BG }}>
        <Text>ID de tarea no proporcionado</Text>
      </LayoutContainer>
    );

  const statusValue = editState?.status ?? task?.status;
  const priorityValue = editState?.priority ?? task?.priority;

  return (
    <LayoutContainer scroll={false} style={{ backgroundColor: BG }}>
      {/*<Header title={`Tarea #${taskId}`} />*/}
      <ScrollView
        contentContainerStyle={[
          styles.container,
          {
            paddingHorizontal: CONTAINER.horizontal,
            paddingTop: CONTAINER.top,
            paddingBottom: CONTAINER.bottom,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ width: '100%', marginBottom: 12, alignItems: 'flex-start' }}>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Ionicons name="chevron-back" size={16} color={BRAND} />}
            onPress={() => router.back()}
          >
            Volver
          </Button>
        </View>

        <View style={[styles.card, { backgroundColor: CARD_BG, borderColor: CARD_BORDER, borderWidth: 1 }]}>
          {loading ? (
            <ActivityIndicator />
          ) : error ? (
            <Text style={{ color: '#E74C3C' }}>{error}</Text>
          ) : task ? (
            <>
              {/* Título + Estado/Prioridad */}
              <View style={styles.headerRow}>
                {editing ? (
                  <Input
                    ref={titleRef}
                    placeholder="Título"
                    placeholderTextColor={PLACEHOLDER}
                    value={editState.title}
                    onChangeText={(t) => setEditState((s: any) => ({ ...s, title: t }))}
                    onEndEditing={onTitleEndEditing}
                    variant="surface"
                    containerStyle={{ flex: 1, marginRight: 8 }}
                    inputStyle={{ fontSize: 18, fontWeight: '800', paddingVertical: 8 }}
                  />
                ) : (
                  <TouchableOpacity onPress={startEditTitle} style={{ flex: 1, marginRight: 8 }}>
                    <Text style={[styles.title, { color: TEXT }]} numberOfLines={2}>
                      {task.title}
                    </Text>
                  </TouchableOpacity>
                )}

                <View style={styles.metaRight}>
                  <TouchableOpacity style={styles.metaGroup} onPress={() => setShowStatusPicker(true)}>
                    <Text style={[styles.metaLabel, { color: SUBTEXT }]}>Estado</Text>
                    <Text style={[styles.metaValue, { color: TEXT }]}>{t(statusMap, statusValue)}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.metaGroup, { marginLeft: 50 }]}
                    onPress={() => setShowPriorityPicker(true)}
                  >
                    <Text style={[styles.metaLabel, { color: SUBTEXT }]}>Prioridad</Text>
                    <Text style={[styles.metaValue, { color: TEXT }]}>{t(priorityMap, priorityValue)}</Text>
                  </TouchableOpacity>
                </View>

                
              </View>

              {/* Descripción */}
              <Text style={[styles.sectionLabel, { color: SUBTEXT }]}>Descripción</Text>
              {editing ? (
                <Input
                  ref={descRef}
                  multiline
                  placeholder="Descripción"
                  placeholderTextColor={PLACEHOLDER}
                  value={editState.description}
                  onChangeText={(t) => setEditState((s: any) => ({ ...s, description: t }))}
                  onEndEditing={onDescriptionEndEditing}
                  variant="surface"
                  inputStyle={{ height: 120, textAlignVertical: 'top' }}
                />
              ) : (
                <TouchableOpacity onPress={startEditDescription}>
                  <Text style={[styles.description, { color: TEXT }]}>{task.description || '—'}</Text>
                </TouchableOpacity>
              )}

              {/* Fecha y Responsable */}
              <View style={styles.row}>
                <View style={styles.field}>
                  <Text style={[styles.fieldLabel, { color: SUBTEXT }]}>Fecha</Text>
                  {editing ? (
                    <Input
                      value={
                        dueDateEditingValue ??
                        (editState.dueDate
                          ? displayDateFromISO(editState.dueDate)
                          : displayDateFromISO(task.dueDate))
                      }
                      placeholder="YYYY/MM/DD"
                      placeholderTextColor={PLACEHOLDER}
                      onChangeText={(t) => setDueDateEditingValue(t)}
                      onEndEditing={() => {
                        const raw = dueDateEditingValue ?? (editState.dueDate ?? task.dueDate ?? '');
                        const iso = parseDisplayDateToISO(String(raw));
                        setEditState((s: any) => ({ ...s, dueDate: iso }));
                        setDueDateEditingValue(null);
                      }}
                      variant="surface"
                    />
                  ) : (
                    <TouchableOpacity
                      onPress={() => {
                        setEditing(true);
                        const display = task.dueDate ? displayDateFromISO(task.dueDate) : '';
                        setEditState((s: any) => ({
                          ...s,
                          title: s.title ?? task.title,
                          description: s.description ?? task.description,
                          status: s.status ?? task.status,
                          priority: s.priority ?? task.priority,
                          dueDate: s.dueDate ?? task.dueDate,
                          assigneeId: s.assigneeId ?? task.assignee?.id ?? task.assigneeId,
                        }));
                        setDueDateEditingValue(display);
                      }}
                    >
                      <Text style={[styles.fieldValue, { color: TEXT }]}>
                        {task.dueDate ? displayDateFromISO(task.dueDate) : '—'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.field}>
                  <Text style={[styles.fieldLabel, { color: SUBTEXT }]}>Responsable</Text>
                  <TouchableOpacity
                    onPress={async () => {
                      try {
                        if (!editing) {
                          setEditing(true);
                          if (!editState || Object.keys(editState).length === 0) {
                            setEditState({
                              title: task.title,
                              description: task.description,
                              status: task.status,
                              priority: task.priority,
                              dueDate: task.dueDate,
                              assigneeId: task.assignee?.id ?? task.assigneeId,
                            });
                          }
                          await new Promise((r) => setTimeout(r, 0));
                        }
                        const projectId = (task as any)?.projectId ?? (task as any)?.project?.id;
                        if (!projectId) throw new Error('Falta projectId');
                        if (projectMembers.length === 0) {
                          const res = await apiFetch(`/projects/${projectId}/members`);
                          const txt = await res.text();
                          if (!res.ok) throw new Error(txt || `HTTP ${res.status}`);
                          const data = txt ? JSON.parse(txt) : [];
                          const list = (data.members ?? data) as any[];
                          const users = list.map((m: any) => ({
                            id: m.userId ?? m.id ?? m.user?.id,
                            name: m.name ?? m.user?.name ?? m.email ?? String(m.userId ?? m.id),
                          }));
                          setProjectMembers(users.filter((u) => u.id));
                        }
                        setAssignModalVisible(true);
                      } catch (e: any) {
                        console.error('Error cargando miembros:', e);
                      }
                    }}
                  >
                    <Text style={[styles.fieldValue, { color: BRAND }]}>
                      {(() => {
                        const selId = editState.assigneeId ?? task.assignee?.id ?? task.assigneeId;
                        const found = projectMembers.find((p) => p.id === selId);
                        return found ? found.name : task.assignee?.name ?? '—';
                      })()}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={[styles.field, { marginTop: 12 }]}>
                <Text style={[styles.fieldLabel, { color: SUBTEXT }]}>Etiquetas</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center" }}>
                    {task?.tags && task.tags.length > 0 ? (
                      task.tags.map((tag: any) => (
                        <View
                          key={tag.id}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            backgroundColor: getTagColor(tag.id),
                            borderRadius: 16,
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                            marginRight: 8,
                            marginBottom: 6,
                          }}
                        >
                          <Text style={{ color: BRAND, fontWeight: "600" }}>{tag.name}</Text>
                          <TouchableOpacity
                            onPress={() => removeTagFromTask(tag.id)}
                            style={{ marginLeft: 6 }}
                          >
                            <Ionicons name="trash-outline" size={16} color="#ff6b6b" />
                          </TouchableOpacity>
                        </View>
                      ))
                    ) : (
                      <Text style={{ color: SUBTEXT, fontStyle: "italic" }}>Sin etiquetas</Text>
                    )}
                  </View>
                </ScrollView>

                <TouchableOpacity onPress={() => setShowTagPicker(true)} style={{ marginTop: 8 }}>
                  <Text style={{ color: BRAND, fontWeight: "600" }}>+ Agregar etiqueta</Text>
                </TouchableOpacity>
              </View>


              {/* Guardar cambios (manual) */}
              {editing && (
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                  <Button title="Guardar" onPress={saveEdits} />
                </View>
              )}


              <Button
                title="Ver historial"
                onPress={() =>
                  router.push({
                    pathname: '/features/task/components/taskhistory',
                    params: { projectId: task.projectId, taskId },
                  })
                }
                fullWidth
                style={{ marginTop: 20 }}
              />
            </>
          ) : (
            <Text style={{ color: TEXT }}>No se encontró la tarea.</Text>
          )}
        </View>
      </ScrollView>

      {/* Picker de Estado */}
      <Modal
        visible={showStatusPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowStatusPicker(false)}
      >
        <View style={styles.sheetOverlay}>
          <View
            style={[styles.sheetCard, { backgroundColor: CARD_BG, borderColor: CARD_BORDER, borderWidth: 1 }]}
          >
            <Text style={[styles.sheetTitle, { color: TEXT }]}>Selecciona estado</Text>
            {STATUS_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[styles.sheetItem, { borderBottomColor: isDark ? '#222' : '#f0f0f0' }]}
                onPress={() => onPickStatus(opt)}
              >
                <Text style={[styles.sheetText, { color: TEXT }]}>{t(statusMap, opt)}</Text>
                {normalize(statusValue) === normalize(opt) && (
                  <Ionicons name="checkmark" size={18} color={BRAND} />
                )}
              </TouchableOpacity>
            ))}
            <Button variant="ghost" title="Cancelar" onPress={() => setShowStatusPicker(false)} />
          </View>
        </View>
      </Modal>

      {/* Picker de Prioridad */}
      <Modal
        visible={showPriorityPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPriorityPicker(false)}
      >
        <View style={styles.sheetOverlay}>
          <View
            style={[styles.sheetCard, { backgroundColor: CARD_BG, borderColor: CARD_BORDER, borderWidth: 1 }]}
          >
            <Text style={[styles.sheetTitle, { color: TEXT }]}>Selecciona prioridad</Text>
            {PRIORITY_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[styles.sheetItem, { borderBottomColor: isDark ? '#222' : '#f0f0f0' }]}
                onPress={() => onPickPriority(opt)}
              >
                <Text style={[styles.sheetText, { color: TEXT }]}>{t(priorityMap, opt)}</Text>
                {normalize(priorityValue) === normalize(opt) && (
                  <Ionicons name="checkmark" size={18} color={BRAND} />
                )}
              </TouchableOpacity>
            ))}
            <Button variant="ghost" title="Cancelar" onPress={() => setShowPriorityPicker(false)} />
          </View>
        </View>
      </Modal>

      {/* Assign modal */}
      <AssignModal
        visible={assignModalVisible}
        onClose={() => setAssignModalVisible(false)}
        users={projectMembers}
        onAssign={(userId: number) => {
          setEditState((s: any) => ({ ...s, assigneeId: Number(userId) }));
          setAssignModalVisible(false);
        }}
      />

      {/* Picker de Etiquetas */}
    <Modal
      visible={showTagPicker}
      transparent
      animationType="fade"
      onRequestClose={() => setShowTagPicker(false)}
    >
      <View style={styles.sheetOverlay}>
        <View
          style={[
            styles.sheetCard,
            { backgroundColor: CARD_BG, borderColor: CARD_BORDER, borderWidth: 1 },
          ]}
        >
          <Text style={[styles.sheetTitle, { color: TEXT }]}>Selecciona etiqueta</Text>

          {projectTags.length === 0 ? (
            <Text style={{ color: SUBTEXT, paddingVertical: 8 }}>
              No hay etiquetas disponibles
            </Text>
          ) : (
            projectTags.map((tag) => (
              <TouchableOpacity
                key={tag.id}
                style={[
                  styles.sheetItem,
                  { borderBottomColor: isDark ? "#222" : "#f0f0f0" },
                ]}
                onPress={() => {
                  assignTagToTask(tag.id);
                  setShowTagPicker(false);
                }}
              >
                <Text style={[styles.sheetText, { color: TEXT }]}>{tag.name}</Text>
                {selectedTag?.id === tag.id ||
                task?.tag?.id === tag.id ? (
                  <Ionicons name="checkmark" size={18} color={BRAND} />
                ) : null}
              </TouchableOpacity>
            ))
          )}

          <TouchableOpacity
            onPress={() => setShowTagPicker(false)}
          >
            <Text style={{ color: SUBTEXT }}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>


      
    </LayoutContainer>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  card: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    elevation: 2,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 18, fontWeight: '800', flex: 1, marginRight: 8 },

  // Estado/Prioridad
  metaRight: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'flex-end' },
  metaGroup: { alignItems: 'flex-end' },
  metaLabel: { fontSize: 11, marginBottom: 2, fontWeight: '600' },
  metaValue: { fontSize: 13, fontWeight: '700' },

  sectionLabel: { marginTop: 12, fontSize: 13, fontWeight: '700' },
  description: { marginTop: 6, lineHeight: 20 },

  row: { flexDirection: 'row', marginTop: 12, gap: 12 },
  field: { flex: 1 },
  fieldLabel: { fontSize: 12 },
  fieldValue: { fontSize: 14, fontWeight: '700' },

  // Adjuntos
  attachmentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  attachmentItem: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, paddingVertical: 8 },
  attachRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, flex: 1 },
  attachmentInfo: { flex: 1, marginLeft: 8 },
  attachText: { marginLeft: 8 },
  attachmentSize: { fontSize: 11, marginTop: 2 },
  deleteAttachmentButton: { padding: 6, marginLeft: 8 },

  // Comentarios
  commentRow: { flexDirection: 'row', marginTop: 10, alignItems: 'flex-start' },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  commentUser: { fontWeight: '700' },
  commentDate: { fontWeight: '400', fontSize: 12 },
  commentText: {},

  emptyText: { fontStyle: 'italic', textAlign: 'center', marginTop: 8 },

  // Modal adjuntos
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { borderRadius: 12, padding: 20, width: '90%', maxWidth: 400 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 20, textAlign: 'center' },
  pickFileButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickFileText: { fontSize: 16, fontWeight: '600', marginTop: 8 },
  pickFileSubtext: { fontSize: 12, marginTop: 4, textAlign: 'center' },
  selectedFile: { flexDirection: 'row', alignItems: 'center', borderRadius: 8, padding: 12, borderWidth: 1 },
  fileInfo: { flex: 1, marginLeft: 12 },
  fileName: { fontSize: 14, fontWeight: '600' },
  fileSize: { fontSize: 12 },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 20 },

  // Bottom-sheet
  sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  sheetCard: { borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16 },
  sheetTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  sheetItem: {
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  sheetText: { fontSize: 15 },
});

