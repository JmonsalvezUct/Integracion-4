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
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Header from '../../../components/ui/header';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
const PRIMARY = '#3B34FF';
import { getAccessToken } from '@/lib/secure-store';
import { apiFetch } from "@/lib/api-fetch";

// Se mantiene la constante por si luego se usan eventos, pero ahora NO se usa.
const TASK_UPDATED = 'TASK_UPDATED';

export default function DetailTask() {
  const params = useLocalSearchParams();
  const router = useRouter();
  
  const taskId = Array.isArray(params.taskId) ? params.taskId[0] : params.taskId;
  const taskDataParam = Array.isArray(params.taskData) ? params.taskData[0] : params.taskData;

  const [task, setTask] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // modo edición “local”: se edita en UI pero NO se persiste
  const [editing, setEditing] = useState(false);
  const [editState, setEditState] = useState<any>({});
  const [newComment, setNewComment] = useState("");

  //Refs para enfocar inputs al tocar el texto
  const titleRef = useRef<TextInput>(null);
  const descRef = useRef<TextInput>(null);

  //Modales para pickers
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);
  
  // Estados para el modal de adjuntos (esto sí queda funcional)
  const [attachModalVisible, setAttachModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);

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
  const normalize = (v: any) => String(v ?? '').toLowerCase().trim().replace(/\s+/g, '_');
  const t = (map: Record<string,string>, v: any) => map[normalize(v)] ?? (v ?? '—');

  // Opciones para pickers
  const STATUS_OPTIONS = ['created', 'in_progress', 'completed', 'archived'];
  const PRIORITY_OPTIONS = ['high', 'medium', 'low'];

  // === Subir archivos con FormData (usa apiFetch) ===
  const apiFetchWithFormData = async (url: string, options: any = {}) => {
    const token = await getAccessToken();
    const headers = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };
    if (options.body instanceof FormData) delete (headers as any)['Content-Type'];
    return apiFetch(url, { ...options, headers });
  };

  // === Cargar datos iniciales ===
  useEffect(() => {
    if (taskDataParam) {
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
        // El estado de edición copia los valores iniciales, pero NO se persiste nada
        setEditState({
          title: correctedTask.title,
          description: correctedTask.description,
          status: correctedTask.status,
          priority: correctedTask.priority,
          dueDate: correctedTask.dueDate,
          assigneeId: correctedTask.assigneeId,
        });
        loadAttachments();
      } catch (e: any) {
        console.error('detail fetch error', e);
        setError(e.message || String(e));
      } finally {
        setLoading(false);
      }
    }
  }, [taskDataParam]);

  const loadAttachments = async () => {
    if (!taskId) return;
    try {
      const res = await apiFetch(`/attachments/${taskId}`);
      if (res.ok) {
        const attachments = await res.json();
        setTask((prev: any) => ({ ...prev, attachments }));
      }
    } catch (error) {
      console.error('Error loading attachments:', error);
    }
  };

  // ================== SIN PERSISTENCIA ==================
  //  funciones “stub” para futuro guardado, pero ahora NO llaman API ni emiten eventos
  function persistTaskPatch(_id: string | number, _patch: Partial<any>) {
    // Intencionalmente vacío: aquí se implementará el guardado más adelante.
  }

  const saveEdits = async () => {
    // Ahora no guarda. Solo cierra el modo edición y vuelve a mostrar los valores originales.
    Alert.alert('Guardado deshabilitado', 'El guardado se implementará más adelante.');
    setEditing(false);
    // Se revertirán cualquier cambio “local” para que quede claro que no se guardó
    if (task) {
      setEditState({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        assigneeId: task.assigneeId,
      });
    }
  };
  // ======================================================

  const postComment = async () => {
    if (!taskId || !newComment.trim()) return;
    try {
      const comment = {
        id: Date.now(),
        text: newComment,
        user: 'Usuario Actual',
        date: new Date().toISOString(),
      };
      // Comentarios locales (no se envían a servidor)
      setTask((t: any) => ({ ...t, comments: [...(t?.comments || []), comment] }));
      setNewComment('');
    } catch (e) {
      console.error('comment error', e);
      setError('Error al añadir comentario');
    }
  };

  // Adjuntos (se mantienen funcionando)
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
        type: file.mimeType || 'application/octet-stream'
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
        attachments: [...(prev.attachments || []), result.attachment]
      }));

      Alert.alert('Éxito', 'Archivo subido correctamente');
      setAttachModalVisible(false);
      setSelectedFile(null);
      loadAttachments();
    } catch (error: any) {
      console.error('❌ Upload error:', error);
      Alert.alert('Error', error.message || 'Error al subir el archivo. Verifica tu conexión.');
    } finally {
      setUploading(false);
    }
  };

  const deleteAttachment = async (attachmentId: number) => {
    try {
      Alert.alert(
        'Eliminar archivo',
        '¿Estás seguro de que quieres eliminar este archivo?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: async () => {
              const token = await getAccessToken();
              const res = await apiFetch(`/attachments/${attachmentId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
              });

              if (res.ok) {
                setTask((prev: any) => ({
                  ...prev,
                  attachments: prev.attachments.filter((a: any) => a.id !== attachmentId)
                }));
                Alert.alert('Éxito', 'Archivo eliminado correctamente');
              } else {
                throw new Error('Error al eliminar archivo');
              }
            }
          }
        ]
      );
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

  // Helpers para activar edición al tocar campos de texto
  const startEditTitle = () => {
    setEditing(true);
    setTimeout(() => titleRef.current?.focus(), 0);
  };
  const startEditDescription = () => {
    setEditing(true);
    setTimeout(() => descRef.current?.focus(), 0);
  };

  // === SIN guardado al salir: solo se edita localmente ===
  const onTitleEndEditing = () => {
    // no-op: no se guarda
  };
  const onDescriptionEndEditing = () => {
    // no-op: no se guarda
  };

  // Pickers: editar localmente, sin persistir
  const onPickStatus = (value: string) => {
    setShowStatusPicker(false);
    setEditing(true);
    setEditState((s:any) => ({ ...s, status: value }));
    // no persist
  };
  const onPickPriority = (value: string) => {
    setShowPriorityPicker(false);
    setEditing(true);
    setEditState((s:any) => ({ ...s, priority: value }));
    // no persist
  };

  if (!taskId) return <SafeAreaView><Text>ID de tarea no proporcionado</Text></SafeAreaView>;

  // Mostrar valores “en edición” si existen, sino los del task original (pero NO se guarda)
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
                {/* Título editable (local) */}
                {editing ? (
                  <TextInput
                    ref={titleRef}
                    style={{ fontSize: 18, fontWeight: '800', flex: 1, marginRight: 8 }}
                    value={editState.title}
                    onChangeText={(t) => setEditState((s:any)=>({ ...s, title: t }))}
                    onEndEditing={onTitleEndEditing}   // no-op
                    placeholder="Título"
                    returnKeyType="done"
                  />
                ) : (
                  <TouchableOpacity onPress={startEditTitle} style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.title}>{task.title}</Text>
                  </TouchableOpacity>
                )}

                {/* Estado y Prioridad (local, sin persistir) */}
                <View style={styles.metaRight}>
                  <TouchableOpacity style={styles.metaGroup} onPress={()=> setShowStatusPicker(true)}>
                    <Text style={styles.metaLabel}>Estado</Text>
                    <Text style={styles.metaValue}>{t(statusMap, statusValue)}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.metaGroup, { marginLeft: 50 }]} onPress={()=> setShowPriorityPicker(true)}>
                    <Text style={styles.metaLabel}>Prioridad</Text>
                    <Text style={styles.metaValue}>{t(priorityMap, priorityValue)}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.sectionLabel}>Descripción</Text>
              {/* Descripción editable (local) */}
              {editing ? (
                <TextInput
                  ref={descRef}
                  multiline
                  value={editState.description}
                  onChangeText={(t)=>setEditState((s:any)=>({...s, description: t}))}
                  onEndEditing={onDescriptionEndEditing}   // no-op
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
                  <Text style={styles.fieldLabel}>Fecha de creación</Text>
                  <Text style={styles.fieldValue}>
                    {task.dueDate
                      ? new Date(task.dueDate).toISOString().slice(0, 10).replace(/-/g, "/")
                      : "—"}
                  </Text>
                </View>
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Responsable</Text>
                  <Text style={styles.fieldValue}>{task.assignee?.name ?? '—'}</Text>
                </View>
              </View>

              {/* Botón Guardar ahora NO guarda */}
              {editing && (
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                  <TouchableOpacity
                    onPress={saveEdits}
                    style={{ padding: 10, backgroundColor: PRIMARY, borderRadius: 8, alignItems:'center' }}
                  >
                    <Text style={{ color: '#fff', fontWeight:'700' }}>Guardar</Text>
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
                          (!selectedFile || uploading) && styles.disabledButton
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
                  <View style={styles.avatarPlaceholder}><Text style={{color:'#fff'}}>{c.user?.[0] ?? 'U'}</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.commentUser}>{c.user} · <Text style={styles.commentDate}>{c.date}</Text></Text>
                    <Text style={styles.commentText}>{c.text}</Text>
                  </View>
                </View>
              ))}

              <View style={{ marginTop: 8 }}>
                <TextInput placeholder="Añadir comentario..." value={newComment} onChangeText={setNewComment} style={{ borderWidth:1, borderColor:'#eee', padding:8, borderRadius:8 }} />
                <TouchableOpacity onPress={postComment} style={{ marginTop:8, backgroundColor: PRIMARY, padding:8, borderRadius:8 }}>
                  <Text style={{ color:'#fff' }}>Comentar</Text>
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

      {/* Picker de Estado (solo local) */}
      <Modal visible={showStatusPicker} transparent animationType="fade" onRequestClose={()=>setShowStatusPicker(false)}>
        <View style={styles.sheetOverlay}>
          <View style={styles.sheetCard}>
            <Text style={styles.sheetTitle}>Selecciona estado</Text>
            {STATUS_OPTIONS.map(opt => (
              <TouchableOpacity key={opt} style={styles.sheetItem} onPress={()=>onPickStatus(opt)}>
                <Text style={styles.sheetText}>{t(statusMap, opt)}</Text>
                {normalize(statusValue) === normalize(opt) && <Ionicons name="checkmark" size={18} color={PRIMARY} />}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.sheetCancel} onPress={()=>setShowStatusPicker(false)}>
              <Text>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Picker de Prioridad (solo local) */}
      <Modal visible={showPriorityPicker} transparent animationType="fade" onRequestClose={()=>setShowPriorityPicker(false)}>
        <View style={styles.sheetOverlay}>
          <View style={styles.sheetCard}>
            <Text style={styles.sheetTitle}>Selecciona prioridad</Text>
            {PRIORITY_OPTIONS.map(opt => (
              <TouchableOpacity key={opt} style={styles.sheetItem} onPress={()=>onPickPriority(opt)}>
                <Text style={styles.sheetText}>{t(priorityMap, opt)}</Text>
                {normalize(priorityValue) === normalize(opt) && <Ionicons name="checkmark" size={18} color={PRIMARY} />}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.sheetCancel} onPress={()=>setShowPriorityPicker(false)}>
              <Text>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.06, elevation: 2 },
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
  attachRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, flex: 1 },
  attachText: { marginLeft: 8, color: '#2a2a2a' },
  commentRow: { flexDirection: 'row', marginTop: 10, alignItems: 'flex-start' },
  avatarPlaceholder: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#3B34FF', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  commentUser: { fontWeight: '700' },
  commentDate: { fontWeight: '400', color: '#666', fontSize: 12 },
  commentText: { color: '#333' },
  historyRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  historyText: { color: '#444' },
  historyDate: { color: '#777', fontSize: 12 },
  emptyText: {
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },

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
  attachmentInfo: {
    flex: 1,
    marginLeft: 8,
  },
  attachmentSize: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  deleteAttachmentButton: {
    padding: 6,
    marginLeft: 8,
  },

  // Modal adjuntos
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  pickFileButton: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickFileText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    color: '#333',
  },
  pickFileSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  selectedFile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  fileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  fileSize: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  uploadButton: {
    backgroundColor: PRIMARY,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  uploadButtonText: {
    color: '#fff',
    fontWeight: '600',
  },

  // Bottom-sheet simple para pickers de estado/prioridad
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheetCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  sheetItem: {
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomColor: '#f0f0f0',
    borderBottomWidth: 1,
  },
  sheetText: {
    fontSize: 15,
  },
  sheetCancel: {
    paddingVertical: 14,
    alignItems: 'center',
  },
});
