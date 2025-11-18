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
import { TaskTimes } from './TaskTimes';
import { Ionicons } from '@expo/vector-icons';
import { normalize, t } from "@/app/utils/format";
import { useTaskDetail } from "../hooks/useTaskDetail";
import { apiFetch } from '@/lib/api-fetch';
import { AssignModal } from './assignmodal';
import { displayDateFromISO, parseDisplayDateToISO } from "@/app/utils/date";


// 🎨 Colores
import { useThemedColors } from '@/hooks/use-theme-color';
// 🧱 Layout y spacing
import LayoutContainer from '@/components/layout/layout_container';
import { CONTAINER } from '@/constants/spacing';

// ✅ Componentes reutilizables
import Input from '@/components/ui/input';
import Button from '@/components/ui/button';


export default function DetailTask() {
  
  const params = useLocalSearchParams();
  const router = useRouter();

  const taskId = Array.isArray(params.taskId) ? params.taskId[0] : params.taskId;
  const taskDataParam = Array.isArray(params.taskData) ? params.taskData[0] : params.taskData;


  const {
    task,
    loading,
    error,
    editing,
    setEditing,
    editState,
    setEditState,
    uploading,
    selectedTag,
    onPickPriority,
    STATUS_OPTIONS,
    PRIORITY_OPTIONS,
    onPickStatus,
    showStatusPicker,
    showPriorityPicker,
    setShowStatusPicker,
    setShowPriorityPicker,
    assignTagToTask,
    removeTagFromTask,
    projectTags,
    showTagPicker,
    setShowTagPicker,
    persistTaskPatch,
    setProjectMembers,
    uploadFile,
    pickDocument,
    deleteAttachment,
    selectedFile,
    setSelectedFile,
    attachModalVisible,
    setAttachModalVisible,
    projectMembers,
    assignModalVisible,
    setAssignModalVisible,
    newComment,
    setNewComment,
    postComment,
    dueDateEditingValue,
    setDueDateEditingValue,
    loadAttachments,
    saveEdits,
    timeModalVisible,
    setTimeModalVisible,
    taskTimes,
    loadingTimes,
    addingTime,
    newTimeEntry,
    setNewTimeEntry,
    addTimeEntry,
    deleteTimeEntry,
    getTotalTime,
    formatMinutes,
    loadTaskTimes,
  } = useTaskDetail(taskId, taskDataParam);

  // Refs (enfoque)
  const titleRef = useRef<any>(null);
  const descRef = useRef<any>(null);

  const TAG_COLORS = [
    "#FFD6A5", // naranja claro
    "#CAFFBF", // verde menta
    "#A0C4FF", // azul suave
    "#BDB2FF", // violeta claro
    "#FFC6FF", // rosado

  ];

  const getTagColor = (id: number) => TAG_COLORS[id % TAG_COLORS.length];

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
    if (editState.title !== task?.title) persistTaskPatch(taskId, { title: editState.title });
  };
  const onDescriptionEndEditing = () => {
  if (!taskId || !task) return;
  if (editState.description !== task?.description) {
    persistTaskPatch(taskId, { description: editState.description });
  }
};


// --- Manejadores de edición de título y descripción ---
  if (!taskId)
    return (
      <LayoutContainer scroll={false} style={{ backgroundColor: BG }}>
        <Text>ID de tarea no proporcionado</Text>
      </LayoutContainer>
    );
  const statusValue = editState?.status ?? task?.status;
  const priorityValue = editState?.priority ?? task?.priority;

if (!taskId) {
  return (
    <LayoutContainer scroll={false} style={{ backgroundColor: BG }}>
      <Text>ID de tarea no proporcionado</Text>
    </LayoutContainer>
  );
}

if (loading) {
  return (
    <LayoutContainer scroll={false} style={{ backgroundColor: BG }}>
      <ActivityIndicator size="large" color={BRAND} />
    </LayoutContainer>
  );
}

if (error) {
  return (
    <LayoutContainer scroll={false} style={{ backgroundColor: BG }}>
      <Text style={{ color: "red" }}>Error: {error}</Text>
    </LayoutContainer>
  );
}

if (!task) {
  return (
    <LayoutContainer scroll={false} style={{ backgroundColor: BG }}>
      <Text style={{ color: TEXT }}>Cargando tarea…</Text>
    </LayoutContainer>
  );
}
console.log("🔵 Render final con task:", task?.id);


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
                      {task?.title}

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
                  <Text style={[styles.description, { color: TEXT }]}>{task?.description || '—'}</Text>
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
                          : displayDateFromISO(task?.dueDate))
                      }
                      placeholder="YYYY/MM/DD"
                      placeholderTextColor={PLACEHOLDER}
                      onChangeText={(t) => setDueDateEditingValue(t)}
                      onEndEditing={() => {
                        const raw = dueDateEditingValue ?? (editState.dueDate ?? task?.dueDate ?? '');
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
                        const display = task?.dueDate ? displayDateFromISO(task.dueDate) : '';
                        setEditState((s: any) => ({
                          ...s,
                          title: s.title ?? task.title,
                          description: s.description ?? task?.description,
                          status: s.status ?? task.status,
                          priority: s.priority ?? task.priority,
                          dueDate: s.dueDate ?? task?.dueDate,
                          assigneeId: s.assigneeId ?? task?.assignee?.id ?? task?.assigneeId,
                        }));
                        setDueDateEditingValue(display);
                      }}
                    >
                      <Text style={[styles.fieldValue, { color: TEXT }]}>
                        {task?.dueDate ? displayDateFromISO(task?.dueDate) : '—'}
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
                              description: task?.description,
                              status: task.status,
                              priority: task.priority,
                              dueDate: task?.dueDate,
                              assigneeId: task?.assignee?.id ?? task?.assigneeId,
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
                        const selId = editState.assigneeId ?? task?.assignee?.id ?? task?.assigneeId;
                        const found = projectMembers.find((p) => p.id === selId);
                        return found ? found.name : task?.assignee?.name ?? '—';
                      })()}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={[styles.field, { marginTop: 12 }]}>
                <Text style={[styles.fieldLabel, { color: SUBTEXT }]}>Etiquetas</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center" }}>
                    {task?.tags && task?.tags.length > 0 ? (
                      task?.tags.map((tag: any) => (
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

              {/* Adjuntos */}
              <View style={styles.attachmentsHeader}>
                <Text style={[styles.sectionLabel, { color: SUBTEXT }]}>Adjuntos</Text>
                <Button
                  onPress={() => setAttachModalVisible(true)}
                  leftIcon={<Ionicons name="add" size={16} color="#fff" />}
                  size="sm"
                  title="Agregar"
                />
              </View>

              {task?.attachments && task?.attachments.length > 0 ? (
                task?.attachments.map((a: any) => (
                  <View
                    key={a.id}
                    style={[styles.attachmentItem, { borderBottomColor: isDark ? '#222' : '#f0f0f0' }]}
                  >
                    <TouchableOpacity
                      style={styles.attachRow}
                    >
                      <Ionicons name="document-attach-outline" size={18} color={SUBTEXT} />
                      <View style={styles.attachmentInfo}>
                        <Text style={[styles.attachText, { color: TEXT }]}>{a.originalName}</Text>
                        <Text style={[styles.attachmentSize, { color: SUBTEXT }]}>
                          {(a.size / 1024).toFixed(1)} KB
                        </Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteAttachment(a.id)} style={styles.deleteAttachmentButton}>
                      <Ionicons name="trash-outline" size={16} color="#ff6b6b" />
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <Text style={[styles.emptyText, { color: SUBTEXT }]}>No hay archivos adjuntos</Text>
              )}

              {/* Modal Adjuntar */}
              <Modal
                visible={attachModalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setAttachModalVisible(false)}
              >
                <View style={styles.modalOverlay}>
                  <View
                    style={[
                      styles.modalContent,
                      { backgroundColor: CARD_BG, borderColor: CARD_BORDER, borderWidth: 1 },
                    ]}
                  >
                    <Text style={[styles.modalTitle, { color: TEXT }]}>Adjuntar Archivo</Text>

                    {selectedFile ? (
                      <View
                        style={[
                          styles.selectedFile,
                          { backgroundColor: MUTED_BG, borderColor: CARD_BORDER },
                        ]}
                      >
                        <Ionicons name="document-outline" size={24} color={BRAND} />
                        <View style={styles.fileInfo}>
                          <Text style={[styles.fileName, { color: TEXT }]}>{selectedFile.name}</Text>
                          <Text style={[styles.fileSize, { color: SUBTEXT }]}>
                            {(selectedFile.size / 1024).toFixed(1)} KB
                          </Text>
                        </View>
                        <TouchableOpacity onPress={() => setSelectedFile(null)}>
                          <Ionicons name="close" size={20} color={SUBTEXT} />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      // Conservamos este botón "dashed" como Touchable por estilo especial
                      <TouchableOpacity
                        style={[
                          styles.pickFileButton,
                          { borderColor: CARD_BORDER, backgroundColor: isDark ? '#1f1f1f' : undefined },
                        ]}
                        onPress={pickDocument}
                      >
                        <Ionicons name="cloud-upload-outline" size={32} color={BRAND} />
                        <Text style={[styles.pickFileText, { color: TEXT }]}>Seleccionar Archivo</Text>
                        <Text style={[styles.pickFileSubtext, { color: SUBTEXT }]}>
                          Tamaño máximo: 10MB • Formatos: Todos
                        </Text>
                      </TouchableOpacity>
                    )}

                    <View style={styles.modalButtons}>
                      <Button
                        variant="outline"
                        title="Cancelar"
                        onPress={() => {
                          setAttachModalVisible(false);
                          setSelectedFile(null);
                        }}
                        style={{ flex: 1 }}
                      />
                      <Button
                        title={uploading ? 'Subiendo…' : 'Subir'}
                        onPress={uploadFile}
                        disabled={!selectedFile || uploading}
                        loading={uploading}
                        style={{ flex: 1 }}
                      />
                    </View>
                  </View>
                </View>
              </Modal>


              <Button
                title="Ver historial"
                onPress={() =>
                  router.push({
                    pathname: '/features/task/components/taskhistory',
                    params: { projectId: task?.projectId, taskId },
                  })
                }
                fullWidth
                style={{ marginTop: 20 }}
              />
              <Button
                title="Ver tiempos"
                onPress={() => setTimeModalVisible(true)}
                leftIcon={<Ionicons name="time-outline" size={16} color="#fff" />}
                fullWidth
                style={{ marginTop: 12 }}
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

      {/* modal tiempo trabajado en tareas */}

      <TaskTimes
        visible={timeModalVisible}
        onClose={() => setTimeModalVisible(false)}
        taskId={taskId}
        projectId={task?.projectId}
        taskTimes={taskTimes}
        loadingTimes={loadingTimes}
        addingTime={addingTime}
        onAddTime={addTimeEntry}
        onDeleteTime={deleteTimeEntry}
        onRefresh={loadTaskTimes}
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
            style={styles.sheetCancel}
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
sheetCancel: {
  paddingVertical: 14,
  alignItems: "center",
},

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
