import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useThemedColors } from '@/hooks/use-theme-color';

interface StatsDatePickerProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
}

export function StatsDatePicker({ label, value, onChange }: StatsDatePickerProps) {
  const { CARD_BG, CARD_BORDER, TEXT, SUBTEXT, BRAND, MUTED_BG } = useThemedColors();
  const [show, setShow] = useState(false);

  const onChangeInternal = (event: any, selectedDate?: Date) => {
    setShow(Platform.OS === 'ios');
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  return (
    <View style={{ marginVertical: 8 }}>
      <TouchableOpacity
        onPress={() => setShow(true)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: 12,
          paddingHorizontal: 12,
          backgroundColor: CARD_BG,
          borderColor: CARD_BORDER,
          borderWidth: 1,
          borderRadius: 8,
        }}
      >
        <View>
          <Text style={{ color: SUBTEXT, fontSize: 12, fontWeight: '600' }}>{label}</Text>
          <Text style={{ fontSize: 16, marginTop: 4, color: TEXT, fontWeight: '500' }}>
            {value.toLocaleDateString('es-ES', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })}
          </Text>
        </View>
        <Ionicons name="calendar-outline" size={24} color={BRAND} />
      </TouchableOpacity>

      {show && (
        <DateTimePicker
          value={value}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onChangeInternal}
          // Para Android, puedes agregar estilos adicionales si es necesario
          style={Platform.OS === 'ios' ? { backgroundColor: CARD_BG } : undefined}
        />
      )}
    </View>
  );
}