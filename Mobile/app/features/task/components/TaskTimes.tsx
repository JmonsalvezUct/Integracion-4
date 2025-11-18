import React, { useState, useEffect } from "react";
import { 
  Modal, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  Alert,
  Platform 
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

// 🎨 Hook de tema
import { useThemedColors } from "@/hooks/use-theme-color";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";

interface TimeEntry {
  id: number;
  durationMinutes: number;
  date: string;
  description?: string;
  userId: number;
  taskId: number;
}

interface TaskTimesProps {
  visible: boolean;
  onClose: () => void;
  taskId?: number | string;
  projectId?: number | string;
  taskTimes: TimeEntry[];
  loadingTimes: boolean;
  addingTime: boolean;
  onAddTime: (entry: { durationMinutes: string; date: string; description: string }) => Promise<boolean>;
  onDeleteTime: (timeId: number) => void;
  onRefresh: () => void;
}

export function TaskTimes({ 
  visible, 
  onClose, 
  taskId,
  projectId,
  taskTimes, 
  loadingTimes, 
  addingTime, 
  onAddTime, 
  onDeleteTime,
  onRefresh 
}: TaskTimesProps) {
  const { CARD_BG, CARD_BORDER, TEXT, SUBTEXT, BRAND, isDark, MUTED_BG } = useThemedColors();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [newTimeEntry, setNewTimeEntry] = useState({
    durationMinutes: '',
    date: new Date().toISOString(),
    description: ''
  });

  //  Cargar tiempos automáticamente cuando el modal se abre
  useEffect(() => {
    if (visible && taskId && projectId) {
      console.log('🔄 Cargando tiempos automáticamente...');
      onRefresh();
    }
  }, [visible, taskId, projectId]);

  // Inicializar la fecha cuando se abre el formulario
  useEffect(() => {
    if (showAddForm) {
      const now = new Date();
      setSelectedDate(now);
      setNewTimeEntry(prev => ({
        ...prev,
        date: now.toISOString()
      }));
    }
  }, [showAddForm]);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setSelectedDate(selectedDate);
      setNewTimeEntry(prev => ({
        ...prev,
        date: selectedDate.toISOString()
      }));
    }
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const formatDisplayDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleAddTime = async (): Promise<void> => {
    if (!newTimeEntry.durationMinutes) {
      Alert.alert("Error", "Por favor ingresa la duración en minutos");
      return;
    }

    if (isNaN(Number(newTimeEntry.durationMinutes)) || Number(newTimeEntry.durationMinutes) <= 0) {
      Alert.alert("Error", "La duración debe ser un número válido mayor a 0");
      return;
    }
    
    const success = await onAddTime(newTimeEntry);
    
    if (success) {
      // Resetear el formulario
      setNewTimeEntry({
        durationMinutes: '',
        date: new Date().toISOString(),
        description: ''
      });
      setSelectedDate(new Date());
      setShowAddForm(false);
      setShowDatePicker(false);
      
      // Recargar los tiempos para asegurar sincronización
      setTimeout(() => {
        onRefresh();
      }, 500);
    }
  };

  const handleClose = () => {
    setShowAddForm(false);
    setShowDatePicker(false);
    setNewTimeEntry({
      durationMinutes: '',
      date: new Date().toISOString(),
      description: ''
    });
    setSelectedDate(new Date());
    onClose();
  };

  const handleRefresh = () => {
    console.log('🔄 Refrescando manualmente...');
    onRefresh();
  };

  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTotalTime = () => {
    return taskTimes.reduce((total, time) => total + (time.durationMinutes || 0), 0);
  };

  const renderTimeEntry = ({ item }: { item: TimeEntry }) => (
    <View style={[styles.timeItem, { borderBottomColor: isDark ? "#2a2a2a" : "#eee" }]}>
      <View style={styles.timeInfo}>
        <Text style={[styles.timeDuration, { color: TEXT }]}>
          {formatMinutes(item.durationMinutes)}
        </Text>
        <Text style={[styles.timeDate, { color: SUBTEXT }]}>
          {formatDate(item.date)}
        </Text>
        {item.description && (
          <Text style={[styles.timeDescription, { color: TEXT }]} numberOfLines={2}>
            {item.description}
          </Text>
        )}
      </View>
      <TouchableOpacity 
        onPress={() => {
          console.log('🗑️ Eliminando registro:', item.id);
          onDeleteTime(item.id);
        }}
        style={styles.deleteButton}
      >
        <Ionicons name="trash-outline" size={16} color="#ff6b6b" />
      </TouchableOpacity>
    </View>
  );

  const renderAddForm = () => (
    <View style={[styles.addForm, { backgroundColor: MUTED_BG }]}>
      <Text style={[styles.formTitle, { color: TEXT }]}>Nuevo Registro</Text>
      
      <Input
        label="Duración (minutos)*"
        placeholder="Ej: 120"
        value={newTimeEntry.durationMinutes}
        onChangeText={(text) => setNewTimeEntry(prev => ({ ...prev, durationMinutes: text }))}
        keyboardType="numeric"
        variant="surface"
        containerStyle={styles.input}
      />

      <View style={styles.input}>
        <Text style={[styles.label, { color: SUBTEXT }]}>Fecha*</Text>
        <TouchableOpacity
          style={[styles.dateButton, { 
            borderColor: CARD_BORDER, 
            backgroundColor: CARD_BG,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 12,
            paddingHorizontal: 12,
            borderRadius: 8,
            borderWidth: 1,
          }]}
          onPress={showDatepicker}
        >
          <View>
            <Text style={[styles.dateButtonText, { color: TEXT }]}>
              {formatDisplayDate(selectedDate)}
            </Text>
          </View>
          <Ionicons name="calendar-outline" size={24} color={BRAND} />
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      <Input
        label="Descripción (opcional)"
        placeholder="Describe el trabajo realizado..."
        value={newTimeEntry.description}
        onChangeText={(text) => setNewTimeEntry(prev => ({ ...prev, description: text }))}
        multiline
        numberOfLines={3}
        variant="surface"
        inputStyle={{ height: 80, textAlignVertical: 'top' }}
        containerStyle={styles.input}
      />

      <View style={styles.formButtons}>
        <Button
          variant="outline"
          title="Cancelar"
          onPress={() => {
            setShowAddForm(false);
            setShowDatePicker(false);
            setNewTimeEntry({
              durationMinutes: '',
              date: new Date().toISOString(),
              description: ''
            });
            setSelectedDate(new Date());
          }}
          style={{ flex: 1 }}
          disabled={addingTime}
        />
        <Button
          title={addingTime ? 'Registrando...' : 'Agregar'}
          onPress={handleAddTime}
          disabled={!newTimeEntry.durationMinutes || addingTime}
          loading={addingTime}
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.container,
            { backgroundColor: CARD_BG, borderColor: CARD_BORDER, borderWidth: 1 },
          ]}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: TEXT }]}>Registros de Tiempo</Text>
            <View style={styles.headerRight}>
              {getTotalTime() > 0 && (
                <Text style={[styles.totalTime, { color: BRAND }]}>
                  Total: {formatMinutes(getTotalTime())}
                </Text>
              )}
              {loadingTimes && (
                <ActivityIndicator size="small" color={BRAND} style={styles.headerLoader} />
              )}
            </View>
          </View>

          {!showAddForm ? (
            <>
              <View style={styles.actions}>
                <Button
                  onPress={() => setShowAddForm(true)}
                  leftIcon={<Ionicons name="add-outline" size={16} color="#fff" />}
                  size="sm"
                  title="Nuevo Registro"
                />
                <TouchableOpacity 
                  onPress={handleRefresh} 
                  style={styles.refreshButton}
                  disabled={loadingTimes}
                >
                  <Ionicons 
                    name="refresh-outline" 
                    size={20} 
                    color={loadingTimes ? SUBTEXT : BRAND} 
                  />
                </TouchableOpacity>
              </View>

              {loadingTimes && taskTimes.length === 0 ? (
                <ActivityIndicator size="large" color={BRAND} style={styles.loader} />
              ) : taskTimes.length > 0 ? (
                <FlatList
                  data={taskTimes}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={renderTimeEntry}
                  style={styles.list}
                  showsVerticalScrollIndicator={false}
                  refreshing={loadingTimes}
                  onRefresh={handleRefresh}
                />
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="time-outline" size={48} color={SUBTEXT} />
                  <Text style={[styles.emptyText, { color: SUBTEXT }]}>
                    No hay registros de tiempo
                  </Text>
                  <Text style={[styles.emptySubtext, { color: SUBTEXT }]}>
                    Agrega tu primer registro de tiempo trabajado
                  </Text>
                  <Button
                    title="Agregar primer registro"
                    onPress={() => setShowAddForm(true)}
                    style={{ marginTop: 16 }}
                  />
                </View>
              )}
            </>
          ) : (
            renderAddForm()
          )}

          <TouchableOpacity 
            style={[styles.close, { opacity: addingTime ? 0.6 : 1 }]} 
            onPress={handleClose}
            disabled={addingTime}
          >
            <Text style={styles.closeText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "90%",
    maxHeight: "80%",
    borderRadius: 16,
    padding: 20,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  totalTime: {
    fontSize: 14,
    fontWeight: "600",
    marginRight: 8,
  },
  headerLoader: {
    marginLeft: 8,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  refreshButton: {
    padding: 8,
  },
  list: {
    maxHeight: 400,
  },
  loader: {
    marginVertical: 40,
  },
  timeItem: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    paddingVertical: 12,
  },
  timeInfo: {
    flex: 1,
  },
  timeDuration: {
    fontSize: 16,
    fontWeight: "700",
  },
  timeDate: {
    fontSize: 12,
    marginTop: 2,
  },
  timeDescription: {
    fontSize: 14,
    marginTop: 4,
    lineHeight: 18,
  },
  deleteButton: {
    padding: 8,
  },
  addForm: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  input: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  dateButton: {
    // Los estilos ahora están inline para seguir exactamente el patrón de StatsDatePicker
  },
  dateButtonText: {
    fontSize: 16,
  },
  formButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 4,
    textAlign: "center",
  },
  close: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#6c757d",
  },
  closeText: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
  },
});