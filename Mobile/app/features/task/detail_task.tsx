import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Modal, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Header from '../../../components/ui/header';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
const PRIMARY = '#3B34FF';
import { getAccessToken } from '@/lib/secure-store';
import { apiFetch } from "@/lib/api-fetch";

export default function DetailTask() {
  const params = useLocalSearchParams();
  const router = useRouter();
  
  const taskId = Array.isArray(params.taskId) ? params.taskId[0] : params.taskId;
  const taskDataParam = Array.isArray(params.taskData) ? params.taskData[0] : params.taskData;

  const [task, setTask] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editState, setEditState] = useState<any>({});
  const [newComment, setNewComment] = useState("");
  
  // Estados para el modal de adjuntos
  const [attachModalVisible, setAttachModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);

  // Función para subir archivos con FormData (usa apiFetch internamente)
  const apiFetchWithFormData = async (url: string, options: any = {}) => {
    const token = await getAccessToken();
    
    const headers = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    // Si es FormData, no establecer Content-Type (se establece automáticamente con boundary)
    if (options.body instanceof FormData) {
      delete headers['Content-Type'];
    }

    // Usar apiFetch en lugar de fetch directo
    return apiFetch(url, {
      ...options,
      headers,
    });
  };

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
        setEditState({
          title: correctedTask.title,
          description: correctedTask.description,
          status: correctedTask.status,
          priority: correctedTask.priority,
          dueDate: correctedTask.dueDate,
          assigneeId: correctedTask.assigneeId,
        });

        // Cargar adjuntos después de cargar la tarea
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

  const saveEdits = async () => {
    if (!taskId) return;
    try {
      const updatedTask = {
        ...task,
        ...editState
      };
      
      setTask(updatedTask);
      setEditing(false);
    } catch (e) {
      console.error('save error', e);
      setError('Error guardando cambios');
    }
  };

  const postComment = async () => {
    if (!taskId || !newComment.trim()) return;
    try {
      const comment = {
        id: Date.now(),
        text: newComment,
        user: 'Usuario Actual',
        date: new Date().toISOString(),
      };
      
      setTask((t: any) => ({ ...t, comments: [...(t.comments || []), comment] }));
      setNewComment('');
    } catch (e) {
      console.error('comment error', e);
      setError('Error al añadir comentario');
    }
  };

  // Funciones para adjuntos
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
      // Crear FormData
      const formData = new FormData();
      formData.append('file', {
        uri: selectedFile.uri,
        type: selectedFile.type,
        name: selectedFile.name,
      } as any);

      console.log('📤 Subiendo archivo:', {
        taskId,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileType: selectedFile.type,
      });

      // Usar la nueva función apiFetchWithFormData
      const res = await apiFetchWithFormData(`/attachments/${taskId}`, {
        method: 'POST',
        body: formData,
      });

      console.log('📡 Response status:', res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ Upload failed:', res.status, errorText);
        throw new Error(`Error ${res.status}: ${errorText}`);
      }

      const result = await res.json();
      console.log('✅ Upload success:', result);
      
      // Actualizar la lista de adjuntos
      setTask((prev: any) => ({
        ...prev,
        attachments: [...(prev.attachments || []), result.attachment]
      }));

      Alert.alert('Éxito', 'Archivo subido correctamente');
      setAttachModalVisible(false);
      setSelectedFile(null);
      
      // Recargar adjuntos
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
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              });

              if (res.ok) {
                // Remover el archivo de la lista
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

  const downloadAttachment = async (attachmentId: number, fileName: string) => {
    try {
      // Para descargar en React Native necesitarías una librería adicional
      // Por ahora solo mostramos un mensaje
      Alert.alert('Descargar', `Funcionalidad de descarga en desarrollo para: ${fileName}`);
      console.log('📥 Descargando archivo:', attachmentId, fileName);
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'No se pudo descargar el archivo');
    }
  };

  if (!taskId) return <SafeAreaView><Text>ID de tarea no proporcionado</Text></SafeAreaView>;

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
                {editing ? (
                  <TextInput style={{ fontSize: 18, fontWeight: '800' }} value={editState.title} onChangeText={(t) => setEditState((s:any)=>({ ...s, title: t }))} />
                ) : (
                  <Text style={styles.title}>{task.title}</Text>
                )}
                <View style={styles.metaRight}>
                  <Text style={styles.meta}>{task.status}</Text>
                  <Text style={styles.meta}>{task.priority}</Text>
                </View>
              </View>

              <Text style={styles.sectionLabel}>Descripción</Text>
              {editing ? (
                <TextInput multiline value={editState.description} onChangeText={(t)=>setEditState((s:any)=>({...s, description: t}))} style={{ minHeight: 80, borderColor: '#eee', borderWidth: 1, padding: 8 }} />
              ) : (
                <Text style={styles.description}>{task.description}</Text>
              )}

              <View style={styles.row}>
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Fecha límite</Text>
                  {editing ? (
                    <TextInput value={editState.dueDate} onChangeText={(t)=>setEditState((s:any)=>({...s, dueDate: t}))} />
                  ) : (
                    <Text style={styles.fieldValue}>{task.dueDate}</Text>
                  )}
                </View>
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Responsable</Text>
                  <Text style={styles.fieldValue}>{task.assignee?.name ?? '—'}</Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                <TouchableOpacity onPress={()=> setEditing(!editing)} style={{ padding: 8, backgroundColor: '#ddd', borderRadius: 8 }}>
                  <Text>{editing ? 'Cancelar' : 'Editar'}</Text>
                </TouchableOpacity>
                {editing && (
                  <TouchableOpacity onPress={saveEdits} style={{ padding: 8, backgroundColor: PRIMARY, borderRadius: 8 }}>
                    <Text style={{ color: '#fff' }}>Guardar</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Sección de Adjuntos Mejorada */}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.06, elevation: 2 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 18, fontWeight: '800', flex: 1, marginRight: 8 },
  metaRight: { alignItems: 'flex-end' },
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

  // Estilos para adjuntos
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

  // Estilos del modal
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
});