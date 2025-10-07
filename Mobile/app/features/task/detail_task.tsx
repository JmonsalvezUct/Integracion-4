import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Header from '../../../components/ui/header';
import { Ionicons } from '@expo/vector-icons';
const PRIMARY = '#3B34FF';
import { API_URL } from '@/constants/api';
import { getAccessToken } from '@/lib/secure-store';


export default function DetailTask() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const taskId = params.taskId as string | undefined;

  const [task, setTask] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editState, setEditState] = useState<any>({});
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    if (!taskId) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/tasks/${taskId}`);
        const json = await res.json();
        setTask(json);
        setEditState({
          title: json.title,
          description: json.description,
          status: json.status,
          priority: json.priority,
          dueDate: json.dueDate,
          assigneeId: json.assigneeId,
        });
      } catch (e: any) {
        console.error('detail fetch error', e);
        setError(e.message || String(e));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [taskId]);

  const saveEdits = async () => {
    if (!taskId) return;
    try {
      
      const payload: any = {};
      if (editState.title !== undefined) payload.title = String(editState.title).trim();
      if (editState.description !== undefined) payload.description = String(editState.description).trim();
      if (editState.dueDate) payload.dueDate = new Date(editState.dueDate).toISOString();
      if (editState.assigneeId) payload.assigneeId = Number(editState.assigneeId);
      if (editState.status) payload.status = editState.status;
      if (editState.priority) payload.priority = editState.priority;

      const token = await getAccessToken();
      console.log('PUT', `${API_URL}/tasks/${taskId}`, payload, 'token?', !!token);
      const res = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error('PUT failed', res.status, text);
        setError(`Error ${res.status}: ${text}`);
        return;
      }

      const updated = await res.json();
      console.log('PUT success', updated);
      setTask(updated);
      setEditing(false);
    } catch (e) {
      console.error('save error', e);
      setError('Error guardando cambios');
    }
  };

  const postComment = async () => {
    if (!taskId || !newComment.trim()) return;
    try {
      const res = await fetch(`${API_URL}/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newComment }),
      });
      const c = await res.json();
      setTask((t: any) => ({ ...t, comments: [...(t.comments || []), c] }));
      setNewComment('');
    } catch (e) {
      console.error('comment error', e);
      setError('Error al añadir comentario');
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

              <Text style={styles.sectionLabel}>Adjuntos</Text>
              {(task.attachments || []).map((a: any) => (
                <TouchableOpacity key={a.id} style={styles.attachRow} onPress={() => {}}>
                  <Ionicons name="attach" size={18} color="#3b3b3b" />
                  <Text style={styles.attachText}>{a.name}</Text>
                </TouchableOpacity>
              ))}

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
  attachRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  attachText: { marginLeft: 8, color: '#2a2a2a' },
  commentRow: { flexDirection: 'row', marginTop: 10, alignItems: 'flex-start' },
  avatarPlaceholder: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#3B34FF', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  commentUser: { fontWeight: '700' },
  commentDate: { fontWeight: '400', color: '#666', fontSize: 12 },
  commentText: { color: '#333' },
  historyRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  historyText: { color: '#444' },
  historyDate: { color: '#777', fontSize: 12 },
});
