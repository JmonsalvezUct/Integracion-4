import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Switch, ScrollView, SafeAreaView, Platform, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import performLogout from '@/app/features/profile/components/logout';
import { Ionicons } from '@expo/vector-icons';
import { getSavedUser, type LoginResponse } from '@/services/auth';

//leer el tema global (light/dark) y la acción para alternar
import { useThemeMode } from '@/app/theme-context';
//paleta para aplicar colores dinámicos
import { Colors } from '@/constants/theme';

type User = LoginResponse['user']; //Se reutiliza el tipo de user ya definido en auth

export default function ProfileScreen() {
  const { theme, toggleTheme } = useThemeMode(); // <- tema global
  const [pushEnabled, setPushEnabled] = React.useState(true);
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();

  //Cargar el usuario al montar la pantalla
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const u = await getSavedUser();
        if (mounted) setUser(u);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Mientras carga, muestra un spinner
  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: Colors[theme].background }]}>
        <View style={[styles.container, { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors[theme].background }]}>
          <ActivityIndicator />
          <Text style={{ marginTop: 8, color: Colors[theme].text }}>Cargando perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Valores seguros para mostrar
  const displayName = (user?.name?.trim() || 'Usuario');
  const displayEmail = (user?.email || '—');

  // Colores dinámicos
  const BG = Colors[theme].background;
  const TEXT = Colors[theme].text;
  const CARD_BG = Colors[theme].background; 
  const BORDER  = Colors[theme].icon;

  // Color de marca (azul) para modo claro
  const BRAND = Colors.light.tint || "#3B34FF";

  
  const isDark = theme === 'dark';
  const camBg = isDark ? '#ffffff' : BRAND;
  const camColor = isDark ? '#000000' : '#ffffff';
  const camBorderColor = isDark ? '#121212' : '#ffffff';
  const camBorderWidth = isDark ? 0 : 2;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: BG }]}>
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: BG }]}>
        <View style={styles.header}>
          <View style={styles.avatarWrap}>
            {/* Foto o ícono por defecto */}
            {user?.profilePicture ? (
              <Image source={{ uri: user.profilePicture }} style={styles.avatarImg} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: BRAND }]}>
                <Ionicons name="person" size={48} color="#fff" />
              </View>
            )}

            {/* 🔹 Botón de cámara con colores por tema */}
            <TouchableOpacity
              style={[
                styles.avatarBtn,
                {
                  backgroundColor: camBg,
                  borderColor: camBorderColor,
                  borderWidth: camBorderWidth,
                },
              ]}
              activeOpacity={0.8}
            >
              <Ionicons name="camera" size={18} color={camColor} />
            </TouchableOpacity>
          </View>

          <View style={styles.userInfo}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[styles.name, { color: TEXT }]}>{displayName}</Text>
              <TouchableOpacity style={{ marginLeft: 8 }}>
                <Ionicons name="pencil" size={18} color={BRAND} />
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
              <Text style={[styles.email, { color: theme === 'dark' ? '#bbb' : '#888' }]}>{displayEmail}</Text>
              <TouchableOpacity style={{ marginLeft: 8 }}>
                <Ionicons name="pencil" size={14} color={BRAND} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: CARD_BG, borderColor: BORDER }]}>
          <Text style={[styles.cardTitle, { color: TEXT }]}>Apariencia</Text>
          <View style={styles.rowBetween}>
            <Text style={[styles.cardText, { color: TEXT }]}>Modo oscuro</Text>
            <Switch value={theme === 'dark'} onValueChange={toggleTheme} />
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: CARD_BG, borderColor: BORDER }]}>
          <Text style={[styles.cardTitle, { color: TEXT }]}>Notificaciones</Text>
          <View style={styles.rowBetween}>
            <Text style={[styles.cardText, { color: TEXT }]}>Notificaciones push</Text>
            <Switch value={pushEnabled} onValueChange={setPushEnabled} />
          </View>
          <TouchableOpacity style={{ marginTop: 10 }}>
            <Text style={[styles.link, { color: BRAND }]}>Gestionar preferencias de notificación</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.card, { backgroundColor: CARD_BG, borderColor: BORDER }]}>
          <Text style={[styles.cardTitle, { color: TEXT }]}>Seguridad</Text>
          <TouchableOpacity style={styles.rowBetween}>
            <Text style={[styles.cardText, { color: TEXT }]}>Cambiar contraseña</Text>
            <Ionicons name="chevron-forward" size={18} color={theme === 'dark' ? '#aaa' : '#999'} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.logoutBtn, { backgroundColor: CARD_BG, borderColor: theme === 'dark' ? '#5c2a2a' : '#ffd6d6' }]}
          activeOpacity={0.8}
          onPress={() => {
            Alert.alert(
              'Cerrar sesión',
              '¿Estás seguro de que quieres cerrar sesión?',
              [
                { text: 'No', style: 'cancel' },
                {
                  text: 'Sí',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await performLogout();
                      router.replace('/auth/login');
                    } catch (err) {
                      console.error('Logout error', err);
                    }
                  },
                },
              ],
              { cancelable: true }
            );
          }}
        >
          <Text style={[styles.logoutText, { color: '#d9534f' }]}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: 16, paddingBottom: 40, paddingTop: Platform.OS === 'android' ? 32 : 18 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatarWrap: { position: 'relative' },
  avatarPlaceholder: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center' },
  avatarImg: { width: 88, height: 88, borderRadius: 44, backgroundColor: '#e9e9ff' },
  avatarBtn: {
    position: 'absolute',
    right: -6,
    bottom: -6,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  userInfo: { marginLeft: 14, flex: 1 },
  name: { fontSize: 22, fontWeight: '800' },
  email: {},

  card: { borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1 },
  cardTitle: { fontWeight: '700', marginBottom: 8 },
  cardText: { fontSize: 16 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  link: {},

  logoutBtn: { marginTop: 18, borderRadius: 10, borderWidth: 1, paddingVertical: 12, alignItems: 'center' },
  logoutText: { fontWeight: '700' },
});
