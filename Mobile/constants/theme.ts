import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#ffffff',
    // 🎯 nuevos tokens
    primary: '#0a7ea4',       // color de marca
    surface: '#ffffff',       // relleno de inputs/cards en claro
    border: '#D1D5DB',        // bordes sutiles
    muted: '#687076',         // textos secundarios
    // (lo tuyo de antes, intacto)
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    // 🎯 nuevos tokens
    primary: '#0a7ea4',       // color de marca (mismo en oscuro)
    surface: '#292929ff',       // ← gris neutro para relleno (ajústalo si quieres)
    border: '#2A2F35',        // borde sutil en oscuro
    muted: '#9BA1A6',
    // (lo tuyo de antes, intacto)
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: { sans: 'system-ui', serif: 'ui-serif', rounded: 'ui-rounded', mono: 'ui-monospace' },
  default: { sans: 'normal', serif: 'serif', rounded: 'normal', mono: 'monospace' },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

