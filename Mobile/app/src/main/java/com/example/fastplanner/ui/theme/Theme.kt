package com.example.fastplanner.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val LightColors = lightColorScheme(
    // Colores principales
    primary            = BluePrimary,
    onPrimary          = Color.White,
    primaryContainer   = BluePrimaryLight,
    onPrimaryContainer = Color.White,

    // Superficies
    surface            = Color.White,    // “tarjeta” blanca
    onSurface          = TextPrimary,
    background         = Color.White,
    onBackground       = TextPrimary,

    // Otros
    outline            = OutlineGray,
    // (dejas error por defecto o lo ajustas cuando definas errores)
)

@Composable
fun FastPlannerTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = LightColors,
        typography  = Typography,
        content     = content
    )
}

