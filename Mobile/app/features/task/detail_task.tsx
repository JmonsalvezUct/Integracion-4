import React, { useEffect, useState, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  Alert,
  DeviceEventEmitter,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Header from '../../../components/ui/header';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';

import { getAccessToken } from '@/lib/secure-store';
import { apiFetch } from '@/lib/api-fetch';
import { AssignModal } from './components/assignmodal';

const PRIMARY = '#3B34FF';
const TASK_UPDATED = 'TASK_UPDATED';

export default function DetailTask() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const taskId = Array.isArray(params.taskId) ? params.taskId[0] : params.taskId;
  const taskDataParam = Array.isArray(params.taskData) ? params.taskData[0] : params.taskData;

  const [task, setTask] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modo edición local (la UI edita y al confirmar se persiste)
  const [editing, setEditing] = useState(false);
  const [editState, setEditState] = useState<any>({});
  const [newComment, setNewComment] = useState('');

  // Refs para enfocar inputs al tocar el texto
  const titleRef = useRef<TextInput>(null);
  const descRef = useRef<TextInput>(null);

  // Modales para pickers
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);

  // Adjuntos
  const [attachModalVisible, setAttachModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  // Assign modal / members
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [projectMembers, setProjectMembers] = useState<Array<{ id: number; name: string }>>([]);
    // Mantiene el mismo formato mostrado mientras se edita la fecha
    const [dueDateEditingValue, setDueDateEditingValue] = useState<string | null>(null);

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
  // Date helpers: formato YYYY/MM/DD 
  const displayDateFromISO = (iso?: string | null) => (iso ? String(iso).slice(0,10).replace(/-/g, '/') : '');
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

  // Opciones para pickers
  const STATUS_OPTIONS = ['created', 'in_progress', 'completed', 'archived'];
  const PRIORITY_OPTIONS = ['high', 'medium', 'low'];

  // Subir archivos con FormData (usa apiFetch)
  const apiFetchWithFormData = async (url: string, options: any = {}) => {
    const token = await getAccessToken();
    const headers = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };
    // FormData pone su propio boundary; no forzar Content-Type
    if (options.body instanceof FormData) delete (headers as any)['Content-Type'];
    return apiFetch(url, { ...options, headers });
    // Nota: apiFetch ya aplica baseURL y maneja tokens refrescados
  };

  // Cargar datos iniciales desde el parámetro
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
      loadAttachments(correctedTask?.id ?? taskId);
    } catch (e: any) {
      console.error('detail fetch error', e);
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }, [taskDataParam]);

  const loadAttachments = async (id?: string | number) => {
    const targetId = id ?? taskId;
    if (!targetId) return;
    try {
      const res = await apiFetch(`/attachments/${targetId}`);
      if (res.ok) {
        const attachments = await res.json();
        setTask((prev: any) => ({ ...prev, attachments }));
      }
    } catch (err) {
      console.error('Error loading attachments:', err);
    }
  };

  // Emitir evento global
  function emitTaskUpdated(updated: any) {
    DeviceEventEmitter.emit(TASK_UPDATED, { task: updated });
  }

  // Persistencia con PUT /tasks/:projectId/:id
  async function persistTaskPatch(id: string | number, patch: Partial<any>) {
    // Optimistic UI local: refleja inmediatamente
    setTask((prev: any) => (prev ? { ...prev, ...patch } : prev));
    setEditState((prev: any) => ({ ...prev, ...patch }));

    try {
      const projectId = (task as any)?.projectId ?? (task as any)?.project?.id;
      if (!projectId) throw new Error('Falta projectId en la tarea.');

      // Solo campos permitidos por el schema de actualización
      const allowed = ['title', 'description', 'dueDate', 'assigneeId', 'status', 'priority'];
      const base = { ...(task ?? {}), ...patch } as any;
      const payload: any = {};
      for (const k of allowed) {
        let v = base[k];
        // Omitir valores nulos/indefinidos
        if (v === null || v === undefined) continue;
        // Normalizar assigneeId: si viene como '' o null, no lo envíes; si viene como string numérico conviértelo
        if (k === 'assigneeId') {
          if (v === '' ) continue;
          if (typeof v === 'string') {
            const n = Number(v);
            if (!Number.isFinite(n)) continue;
            v = n;
          }
        }
        // Evitar enviar strings vacíos
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
        // Pista: si responde HTML es host equivocado (front en vez de API)
        if (text && /^\s*<!DOCTYPE html>/i.test(text)) {
          throw new Error('La URL de API devolvió HTML (host incorrecto)');
        }
        throw new Error(text || `HTTP ${res.status}`);
      }

      const serverTask = text ? JSON.parse(text) : { ...(task ?? {}), ...patch };
      setTask(serverTask);
      emitTaskUpdated(serverTask); // 🔔 avisa a lista/kanban
    } catch (err: any) {
      console.error('Persist error:', err);
      Alert.alert('No se pudo guardar', err?.message ?? 'Intenta nuevamente.');
    }
  }

  // Guardado manual (opcional) — guarda sólo lo que cambió
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
    // comparar valores ISO normalizados
    const editDue = normalizeDateForCompare(editState.dueDate);
    const taskDue = normalizeDateForCompare((task as any).dueDate);
    if (editDue !== taskDue) {
      patch.dueDate = editDue === '' ? null : editDue;
    }
    if (Object.keys(patch).length === 0) {
      setEditing(false);
      return;
    }
    await persistTaskPatch(taskId, patch);
    setEditing(false);
  };

  // Comentarios locales (no se persisten en server)
  const postComment = async () => {
    if (!taskId || !newComment.trim()) return;
    try {
      const comment = {
        id: Date.now(),
        text: newComment,
        user: 'Usuario Actual',
        date: new Date().toISOString(),
      };
      setTask((t: any) => ({ ...t, comments: [...(t?.comments || []), comment] }));
      setNewComment('');
    } catch (e) {
      console.error('comment error', e);
      setError('Error al añadir comentario');
    }
  };

  // Adjuntos
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const file = result.assets[0];
      setSelectedFile({
        name: file.name,
        uri: file.uri,
        size: file.size,
        type: file.mimeType || 'application/octet-stream',
      });
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'No se pudo seleccionar el archivo');
    }
  };

  const uploadFile = async () => {
    if (!selectedFile || !taskId) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: selectedFile.uri,
        type: selectedFile.type,
        name: selectedFile.name,
      } as any);

      const res = await apiFetchWithFormData(`/attachments/${taskId}`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error ${res.status}: ${errorText}`);
      }

      const result = await res.json();
      setTask((prev: any) => ({
        ...prev,
        attachments: [...(prev.attachments || []), result.attachment],
      }));

      Alert.alert('Éxito', 'Archivo subido correctamente');
      setAttachModalVisible(false);
      setSelectedFile(null);
      loadAttachments(taskId);
    } catch (error: any) {
      console.error('❌ Upload error:', error);
      Alert.alert('Error', error.message || 'Error al subir el archivo. Verifica tu conexión.');
    } finally {
      setUploading(false);
    }
  };

  const deleteAttachment = async (attachmentId: number) => {
    try {
      Alert.alert('Eliminar archivo', '¿Estás seguro de que quieres eliminar este archivo?', [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const token = await getAccessToken();
            const res = await apiFetch(`/attachments/${attachmentId}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
              setTask((prev: any) => ({
                ...prev,
                attachments: prev.attachments.filter((a: any) => a.id !== attachmentId),
              }));
              Alert.alert('Éxito', 'Archivo eliminado correctamente');
            } else {
              throw new Error('Error al eliminar archivo');
            }
          },
        },
      ]);
    } catch (error) {
      console.error('Delete error:', error);
      Alert.alert('Error', 'No se pudo eliminar el archivo');
    }
  };

  const downloadAttachment = async (_attachmentId: number, fileName: string) => {
    try {
      Alert.alert('Descargar', `Funcionalidad de descarga en desarrollo para: ${fileName}`);
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'No se pudo descargar el archivo');
    }
  };

  // Helpers: activar edición al tocar campos de texto
  const startEditTitle = () => {
    setEditing(true);
    setTimeout(() => titleRef.current?.focus(), 0);
  };
  const startEditDescription = () => {
    setEditing(true);
    setTimeout(() => descRef.current?.focus(), 0);
  };

  // Guardado al salir de inputs (si cambió algo)
  const onTitleEndEditing = () => {
    if (!taskId || !task) return;
    if (editState.title !== task.title) persistTaskPatch(taskId, { title: editState.title });
  };
  const onDescriptionEndEditing = () => {
    if (!taskId || !task) return;
    if (editState.description !== task.description)
      persistTaskPatch(taskId, { description: editState.description });
  };

  // Pickers: editar y guardar al instante
  const onPickStatus = (value: string) => {
    setShowStatusPicker(false);
    setEditing(true);
    setEditState((s: any) => ({ ...s, status: value }));
    if (taskId) persistTaskPatch(taskId, { status: value });
  };
  const onPickPriority = (value: string) => {
    setShowPriorityPicker(false);
    setEditing(true);
    setEditState((s: any) => ({ ...s, priority: value }));
    if (taskId) persistTaskPatch(taskId, { priority: value });
  };

  if (!taskId) return <SafeAreaView><Text>ID de tarea no proporcionado</Text></SafeAreaView>;

  // Mostrar valores en edición si existen; si no, los del task original
  const statusValue = editState?.status ?? task?.status;
  const priorityValue = editState?.priority ?? task?.priority;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f4f6fb' }}>
      <Header title={`Tarea #${taskId}`} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          {loading ? (
            <ActivityIndicator />
          ) : error ? (
            <Text style={{ color: 'red' }}>{error}</Text>
          ) : task ? (
            <>
              <View style={styles.headerRow}>
                {/* Título editable: guarda al salir */}
                {editing ? (
                  <TextInput
                    ref={titleRef}
                    style={{ fontSize: 18, fontWeight: '800', flex: 1, marginRight: 8 }}
                    value={editState.title}
                    onChangeText={(t) => setEditState((s: any) => ({ ...s, title: t }))}
                    onEndEditing={onTitleEndEditing}
                    placeholder="Título"
                    returnKeyType="done"
                  />
                ) : (
                  <TouchableOpacity onPress={startEditTitle} style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.title}>{task.title}</Text>
                  </TouchableOpacity>
                )}

                {/* Estado y Prioridad (pickers) */}
                <View style={styles.metaRight}>
                  <TouchableOpacity
                    style={styles.metaGroup}
                    onPress={() => setShowStatusPicker(true)}
                  >
                    <Text style={styles.metaLabel}>Estado</Text>
                    <Text style={styles.metaValue}>{t(statusMap, statusValue)}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.metaGroup, { marginLeft: 50 }]}
                    onPress={() => setShowPriorityPicker(true)}
                  >
                    <Text style={styles.metaLabel}>Prioridad</Text>
                    <Text style={styles.metaValue}>{t(priorityMap, priorityValue)}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.sectionLabel}>Descripción</Text>
              {/* Descripción editable: guarda al salir */}
              {editing ? (
                <TextInput
                  ref={descRef}
                  multiline
                  value={editState.description}
                  onChangeText={(t) => setEditState((s: any) => ({ ...s, description: t }))}
                  onEndEditing={onDescriptionEndEditing}
                  style={{ minHeight: 80, borderColor: '#eee', borderWidth: 1, padding: 8, borderRadius: 8 }}
                  placeholder="Descripción"
                  returnKeyType="done"
                />
              ) : (
                <TouchableOpacity onPress={startEditDescription}>
                  <Text style={styles.description}>{task.description}</Text>
                </TouchableOpacity>
              )}

              <View style={styles.row}>
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Fecha</Text>
                  {editing ? (
                    <TextInput
                      value={
                        dueDateEditingValue ?? (
                          editState.dueDate ? displayDateFromISO(editState.dueDate) : displayDateFromISO(task.dueDate)
                        )
                      }
                      placeholder="YYYY/MM/DD"
                      onChangeText={(t) => setDueDateEditingValue(t)}
                      onEndEditing={() => {
                        // when finished editing inline, write back normalized ISO into editState so saveEdits will persist
                        const raw = dueDateEditingValue ?? (editState.dueDate ?? task.dueDate ?? '');
                        const iso = parseDisplayDateToISO(String(raw));
                        setEditState((s:any) => ({ ...s, dueDate: iso }));
                        setDueDateEditingValue(null);
                      }}
                      style={{ borderColor: '#eee', borderWidth: 1, padding: 6, borderRadius: 6 }}
                    />
                  ) : (
                    <TouchableOpacity onPress={() => {
                      // enable editing and seed dueDateEditingValue with the displayed format
                      setEditing(true);
                      const display = task.dueDate ? displayDateFromISO(task.dueDate) : '';
                      setEditState((s:any) => ({
                        ...s,
                        title: s.title ?? task.title,
                        description: s.description ?? task.description,
                        status: s.status ?? task.status,
                        priority: s.priority ?? task.priority,
                        dueDate: s.dueDate ?? task.dueDate,
                        assigneeId: s.assigneeId ?? task.assignee?.id ?? task.assigneeId,
                      }));
                      setDueDateEditingValue(display);
                    }}>
                      <Text style={styles.fieldValue}>{task.dueDate ? displayDateFromISO(task.dueDate) : '—'}</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Responsable</Text>
                  <TouchableOpacity onPress={async () => {
                    try {
                      // If not already editing, enable editing and seed editState
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
                        // allow a tiny delay so state applies before opening modal (optional)
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
                        const users = list.map((m:any) => ({ id: m.userId ?? m.id ?? m.user?.id, name: m.name ?? m.user?.name ?? m.email ?? String(m.userId ?? m.id) }));
                        setProjectMembers(users.filter(u => u.id));
                      }
                      setAssignModalVisible(true);
                    } catch (e:any) {
                      console.error('Error cargando miembros:', e);
                    }
                  }}>
                    <Text style={[styles.fieldValue, { color: PRIMARY }]}> {
                      
                      (() => {
                        const selId = editState.assigneeId ?? task.assignee?.id ?? task.assigneeId;
                        const found = projectMembers.find(p => p.id === selId);
                        return found ? found.name : (task.assignee?.name ?? '—');
                      })()
                    }</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Botón Guardar (opcional si prefieres guardar manualmente cambios múltiples) */}
              {editing && (
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                  <TouchableOpacity
                    onPress={saveEdits}
                    style={{ padding: 10, backgroundColor: PRIMARY, borderRadius: 8, alignItems: 'center' }}
                  >
                    <Text style={{ color: '#fff', fontWeight: '700' }}>Guardar</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Adjuntos */}
              <View style={styles.attachmentsHeader}>
                <Text style={styles.sectionLabel}>Adjuntos</Text>
                <TouchableOpacity
                  onPress={() => setAttachModalVisible(true)}
                  style={styles.addAttachmentButton}
                >
                  <Ionicons name="add" size={16} color="#fff" />
                  <Text style={styles.addAttachmentText}>Agregar</Text>
                </TouchableOpacity>
              </View>

              {(task.attachments && task.attachments.length > 0) ? (
                task.attachments.map((a: any) => (
                  <View key={a.id} style={styles.attachmentItem}>
                    <TouchableOpacity
                      style={styles.attachRow}
                      onPress={() => downloadAttachment(a.id, a.originalName)}
                    >
                      <Ionicons name="document-attach-outline" size={18} color="#3b3b3b" />
                      <View style={styles.attachmentInfo}>
                        <Text style={styles.attachText}>{a.originalName}</Text>
                        <Text style={styles.attachmentSize}>
                          {(a.size / 1024).toFixed(1)} KB
                        </Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => deleteAttachment(a.id)}
                      style={styles.deleteAttachmentButton}
                    >
                      <Ionicons name="trash-outline" size={16} color="#ff4444" />
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No hay archivos adjuntos</Text>
              )}

              {/* Modal para Adjuntar Archivos */}
              <Modal
                visible={attachModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setAttachModalVisible(false)}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Adjuntar Archivo</Text>

                    {selectedFile ? (
                      <View style={styles.selectedFile}>
                        <Ionicons name="document-outline" size={24} color={PRIMARY} />
                        <View style={styles.fileInfo}>
                          <Text style={styles.fileName}>{selectedFile.name}</Text>
                          <Text style={styles.fileSize}>
                            {(selectedFile.size / 1024).toFixed(1)} KB
                          </Text>
                        </View>
                        <TouchableOpacity onPress={() => setSelectedFile(null)}>
                          <Ionicons name="close" size={20} color="#666" />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity style={styles.pickFileButton} onPress={pickDocument}>
                        <Ionicons name="cloud-upload-outline" size={32} color={PRIMARY} />
                        <Text style={styles.pickFileText}>Seleccionar Archivo</Text>
                        <Text style={styles.pickFileSubtext}>
                          Tamaño máximo: 10MB • Formatos: Todos
                        </Text>
                      </TouchableOpacity>
                    )}

                    <View style={styles.modalButtons}>
                      <TouchableOpacity
                        style={[styles.modalButton, styles.cancelButton]}
                        onPress={() => {
                          setAttachModalVisible(false);
                          setSelectedFile(null);
                        }}
                      >
                        <Text style={styles.cancelButtonText}>Cancelar</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.modalButton,
                          styles.uploadButton,
                          (!selectedFile || uploading) && styles.disabledButton,
                        ]}
                        onPress={uploadFile}
                        disabled={!selectedFile || uploading}
                      >
                        {uploading ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <Text style={styles.uploadButtonText}>Subir</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>

              {/* Comentarios / Historial (locales) */}
              <Text style={styles.sectionLabel}>Comentarios</Text>
              {(task.comments || []).map((c: any) => (
                <View key={c.id} style={styles.commentRow}>
                  <View style={styles.avatarPlaceholder}>
                    <Text style={{ color: '#fff' }}>{c.user?.[0] ?? 'U'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.commentUser}>
                      {c.user} · <Text style={styles.commentDate}>{c.date}</Text>
                    </Text>
                    <Text style={styles.commentText}>{c.text}</Text>
                  </View>
                </View>
              ))}

              <View style={{ marginTop: 8 }}>
                <TextInput
                  placeholder="Añadir comentario..."
                  value={newComment}
                  onChangeText={setNewComment}
                  style={{ borderWidth: 1, borderColor: '#eee', padding: 8, borderRadius: 8 }}
                />
                <TouchableOpacity
                  onPress={postComment}
                  style={{ marginTop: 8, backgroundColor: PRIMARY, padding: 8, borderRadius: 8 }}
                >
                  <Text style={{ color: '#fff' }}>Comentar</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.sectionLabel}>Historial</Text>
              {(task.history || []).map((h: any) => (
                <View key={h.id} style={styles.historyRow}>
                  <Text style={styles.historyText}>{h.text}</Text>
                  <Text style={styles.historyDate}>{h.date}</Text>
                </View>
              ))}
            </>
          ) : (
            <Text>No se encontró la tarea.</Text>
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
          <View style={styles.sheetCard}>
            <Text style={styles.sheetTitle}>Selecciona estado</Text>
            {STATUS_OPTIONS.map((opt) => (
              <TouchableOpacity key={opt} style={styles.sheetItem} onPress={() => onPickStatus(opt)}>
                <Text style={styles.sheetText}>{t(statusMap, opt)}</Text>
                {normalize(statusValue) === normalize(opt) && (
                  <Ionicons name="checkmark" size={18} color={PRIMARY} />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.sheetCancel} onPress={() => setShowStatusPicker(false)}>
              <Text>Cancelar</Text>
            </TouchableOpacity>
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
          <View style={styles.sheetCard}>
            <Text style={styles.sheetTitle}>Selecciona prioridad</Text>
            {PRIORITY_OPTIONS.map((opt) => (
              <TouchableOpacity key={opt} style={styles.sheetItem} onPress={() => onPickPriority(opt)}>
                <Text style={styles.sheetText}>{t(priorityMap, opt)}</Text>
                {normalize(priorityValue) === normalize(opt) && (
                  <Ionicons name="checkmark" size={18} color={PRIMARY} />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.sheetCancel} onPress={() => setShowPriorityPicker(false)}>
              <Text>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Assign modal (selección de responsable) */}
      <AssignModal
        visible={assignModalVisible}
        onClose={() => setAssignModalVisible(false)}
        users={projectMembers}
        onAssign={(userId: number) => {
          setEditState((s:any) => ({ ...s, assigneeId: Number(userId) }));
          setAssignModalVisible(false);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    elevation: 2,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 18, fontWeight: '800', flex: 1, marginRight: 8 },

  // Estado/Prioridad con etiqueta arriba
  metaRight: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
  },
  metaGroup: {
    alignItems: 'flex-end',
  },
  metaLabel: {
    fontSize: 11,
    color: '#000000ff',
    marginBottom: 2,
    fontWeight: '600',
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
  },

  meta: { fontSize: 12, color: '#444' },
  sectionLabel: { marginTop: 12, fontSize: 13, fontWeight: '700' },
  description: { marginTop: 6, color: '#333', lineHeight: 20 },
  row: { flexDirection: 'row', marginTop: 12 },
  field: { flex: 1 },
  fieldLabel: { fontSize: 12, color: '#666' },
  fieldValue: { fontSize: 14, fontWeight: '700' },

  // Adjuntos
  attachmentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  addAttachmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PRIMARY,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  addAttachmentText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingVertical: 8,
  },
  attachRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, flex: 1 },
  attachmentInfo: { flex: 1, marginLeft: 8 },
  attachText: { marginLeft: 8, color: '#2a2a2a' },
  attachmentSize: { fontSize: 11, color: '#666', marginTop: 2 },
  deleteAttachmentButton: { padding: 6, marginLeft: 8 },

  // Comentarios / Historial
  commentRow: { flexDirection: 'row', marginTop: 10, alignItems: 'flex-start' },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3B34FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  commentUser: { fontWeight: '700' },
  commentDate: { fontWeight: '400', color: '#666', fontSize: 12 },
  commentText: { color: '#333' },
  historyRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  historyText: { color: '#444' },
  historyDate: { color: '#777', fontSize: 12 },
  emptyText: { color: '#999', fontStyle: 'italic', textAlign: 'center', marginTop: 8 },

  // Modal adjuntos
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 20, width: '90%', maxWidth: 400 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 20, textAlign: 'center' },
  pickFileButton: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickFileText: { fontSize: 16, fontWeight: '600', marginTop: 8, color: '#333' },
  pickFileSubtext: { fontSize: 12, color: '#666', marginTop: 4, textAlign: 'center' },
  selectedFile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  fileInfo: { flex: 1, marginLeft: 12 },
  fileName: { fontSize: 14, fontWeight: '600', color: '#333' },
  fileSize: { fontSize: 12, color: '#666', marginTop: 2 },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 20 },
  modalButton: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  cancelButton: { backgroundColor: '#f8f9fa', borderWidth: 1, borderColor: '#dee2e6' },
  uploadButton: { backgroundColor: PRIMARY },
  disabledButton: { backgroundColor: '#ccc' },
  cancelButtonText: { color: '#333', fontWeight: '600' },
  uploadButtonText: { color: '#fff', fontWeight: '600' },

  // Bottom-sheet para pickers
  sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  sheetCard: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16 },
  sheetTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  sheetItem: {
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomColor: '#f0f0f0',
    borderBottomWidth: 1,
  },
  sheetText: { fontSize: 15 },
  sheetCancel: { paddingVertical: 14, alignItems: 'center' },
});
