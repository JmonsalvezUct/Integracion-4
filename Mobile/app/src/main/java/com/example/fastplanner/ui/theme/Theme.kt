package com.example.fastplanner.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

// ===== Esquema claro (mapea tus colores a tokens M3) =====
private val LightColors = lightColorScheme(
    // Principales
    primary            = BluePrimary,
    onPrimary          = Color.White,
    primaryContainer   = BluePrimaryLight,
    onPrimaryContainer = Color.White,

    // Fondos y superficies
    background         = ContentBgColor,   // usa tu gris claro de layout
    onBackground       = TextPrimary,
    surface            = Color.White,
    onSurface          = TextPrimary,
    onSurfaceVariant   = TextSecondary,

    // Bordes / dividers
    outlineVariant     = OutlineGray
)

// ===== Esquema oscuro =====
private val DarkColors = darkColorScheme(
    // Principales (mantenemos el mismo primario para marca)
    primary            = BluePrimary,
    onPrimary          = Color.White,
    primaryContainer   = PrimaryContainerDark,
    onPrimaryContainer = TextPrimaryDark,

    // Fondos y superficies
    background         = BackgroundDark,
    onBackground       = TextPrimaryDark,
    surface            = SurfaceDark,
    onSurface          = TextPrimaryDark,
    onSurfaceVariant   = TextSecondaryDark,

    // Bordes / dividers
    outlineVariant     = OutlineVariantDark
)

/**
 * Tema global de FastPlanner con soporte claro/oscuro.
 * En MainActivity:  FastPlannerTheme(darkTheme = isDark) { ... }
 */
@Composable
fun FastPlannerTheme(
    darkTheme: Boolean,
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = if (darkTheme) DarkColors else LightColors,
        typography  = Typography,
        content     = content
    )
}


