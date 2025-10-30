import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Switch,
  ScrollView,
  SafeAreaView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import performLogout from '@/app/features/profile/components/logout';
import { getSavedUser, type LoginResponse } from '@/services/auth';

// 🎨 Tema y componentes
import { useThemeMode } from '@/app/theme-context';
import { Colors } from '@/constants/theme';
import Button from '@/components/ui/button';

type User = LoginResponse['user'];

export default function ProfileScreen() {
  const { theme, toggleTheme } = useThemeMode();
  const [pushEnabled, setPushEnabled] = React.useState(true);
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();

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
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: Colors[theme].background }]}>
        <View style={[styles.centered, { backgroundColor: Colors[theme].background }]}>
          <ActivityIndicator />
          <Text style={{ marginTop: 8, color: Colors[theme].text }}>Cargando perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const displayName = user?.name?.trim() || 'Usuario';
  const displayEmail = user?.email || '—';

  //temas
  const BG = Colors[theme].background;
  const TEXT = Colors[theme].text;
  const BORDER = Colors[theme].icon;       
  const BRAND = Colors.light.tint || '#0a7ea4';

  const logout = async () => {
    Alert.alert('Cerrar sesión', '¿Estás seguro de que quieres cerrar sesión?', [
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
    ]);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: BG }]}>
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: BG }]}>
        {/* Header de usuario */}
        <View style={styles.header}>
          <View style={styles.avatarWrap}>
            {user?.profilePicture ? (
              <Image source={{ uri: user.profilePicture }} style={styles.avatarImg} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: BRAND }]}>
                <Ionicons name="person" size={48} color="#fff" />
              </View>
            )}

            {/* Cámara – forzamos remount por tema para evitar artefactos visuales */}
            <Button
              key={`camera-${theme}`}
              variant="solid"
              size="sm"
              style={[
                styles.avatarBtn,
                {
                  backgroundColor: Colors[theme].primary,                 // relleno marca
                  borderColor: theme === 'light' ? '#ffffff' : 'transparent',
                  borderWidth: theme === 'light' ? 2 : 0,
                },
              ]}
              leftIcon={<Ionicons name="camera" size={18} color="#ffffff" />}
              onPress={() => console.log('Cambiar foto')}
            />
          </View>

          <View style={styles.userInfo}>
            <View style={styles.inline}>
              <Text style={[styles.name, { color: TEXT }]}>{displayName}</Text>
              <Ionicons name="pencil" size={18} color={BRAND} style={{ marginLeft: 8 }} />
            </View>

            <View style={[styles.inline, { marginTop: 6 }]}>
              <Text style={[styles.email, { color: theme === 'dark' ? '#bbb' : '#888' }]}>{displayEmail}</Text>
              <Ionicons name="pencil" size={14} color={BRAND} style={{ marginLeft: 8 }} />
            </View>
          </View>
        </View>

        {/* Apariencia */}
        <View style={[styles.card, { borderColor: BORDER }]}>
          <Text style={[styles.cardTitle, { color: TEXT }]}>Apariencia</Text>
          <View style={styles.rowBetween}>
            <Text style={[styles.cardText, { color: TEXT }]}>Modo oscuro</Text>
            <Switch value={theme === 'dark'} onValueChange={toggleTheme} />
          </View>
        </View>

        {/* Notificaciones */}
        <View style={[styles.card, { borderColor: BORDER }]}>
          <Text style={[styles.cardTitle, { color: TEXT }]}>Notificaciones</Text>
          <View style={styles.rowBetween}>
            <Text style={[styles.cardText, { color: TEXT }]}>Notificaciones push</Text>
            <Switch value={pushEnabled} onValueChange={setPushEnabled} />
          </View>
          <Text style={[styles.link, { color: Colors[theme].primary, marginTop: 10 }]}>
            Gestionar preferencias de notificación
          </Text>
        </View>

        {/* Seguridad */}
        <View style={[styles.card, { borderColor: BORDER }]}>
          <Text style={[styles.cardTitle, { color: TEXT }]}>Seguridad</Text>
          <View style={styles.rowBetween}>
            <Text style={[styles.cardText, { color: TEXT }]}>Cambiar contraseña</Text>
            <Ionicons name="chevron-forward" size={18} color={theme === 'dark' ? '#aaa' : '#999'} />
          </View>
        </View>

        {/* Botón de logout – outline real sin fondo */}
        <Button
          key={`logout-${theme}`}
          variant="outline"
          fullWidth
          style={[
            styles.logoutBtn,
            { borderColor: theme === 'dark' ? '#5c2a2a' : '#ffd6d6' }, // sin backgroundColor
          ]}
          textStyle={[styles.logoutText, { color: '#d9534f' }]}
          onPress={logout}
        >
          Cerrar sesión
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: {
    padding: 16,
    paddingBottom: 40,
    paddingTop: Platform.OS === 'android' ? 32 : 18,
  },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatarWrap: { position: 'relative' },
  avatarPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
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

  inline: { flexDirection: 'row', alignItems: 'center' },

  card: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
  },
  cardTitle: { fontWeight: '700', marginBottom: 8 },
  cardText: { fontSize: 16 },

  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  link: {},

  logoutBtn: { marginTop: 18, borderRadius: 10, borderWidth: 1, paddingVertical: 12 },
  logoutText: { fontWeight: '700', textAlign: 'center' },
});
