import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

interface StatsDatePickerProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
}

export function StatsDatePicker({ label, value, onChange }: StatsDatePickerProps) {
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
          paddingVertical: 8,
          paddingHorizontal: 12,
          backgroundColor: '#f5f5f5',
          borderRadius: 8,
        }}
      >
        <View>
          <Text style={{ color: '#666', fontSize: 12 }}>{label}</Text>
          <Text style={{ fontSize: 16, marginTop: 4 }}>
            {value.toLocaleDateString()}
          </Text>
        </View>
        <Ionicons name="calendar-outline" size={24} color="#666" />
      </TouchableOpacity>

      {show && (
        <DateTimePicker
          value={value}
          mode="date"
          display="default"
          onChange={onChangeInternal}
        />
      )}
    </View>
  );
}
