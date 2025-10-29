// Escala de espaciados global y helpers pequeños.
// Se utiliza en todo el proyecto para padding/margin consistentes.

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 40,
} as const;

// Atajos frecuentes para contenedores
export const CONTAINER = {
  horizontal: SPACING.md, // paddingHorizontal estándar
  top: SPACING.lg,        // separación superior estándar para títulos/bloques
  bottom: SPACING.xl,     // separación inferior para scrolls largos
} as const;
