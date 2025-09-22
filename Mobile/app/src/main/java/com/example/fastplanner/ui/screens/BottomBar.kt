package com.example.fastplanner.ui.screens

import androidx.compose.foundation.layout.RowScope
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ListAlt
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.Folder
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.vector.ImageVector

/**
 * Barra inferior compartida para TODAS las screens.
 * Usa el enum BottomItem para definir el item seleccionado.
 */
@Composable
fun AppBottomBar(
    selected: BottomItem,
    onSelected: (BottomItem) -> Unit,
) {
    NavigationBar {
        NavItem(Icons.Filled.Home, "Inicio", selected == BottomItem.Home) { onSelected(BottomItem.Home) }
        NavItem(Icons.Filled.Folder, "Proyectos", selected == BottomItem.Projects) { onSelected(BottomItem.Projects) }
        NavItem(Icons.AutoMirrored.Filled.ListAlt, "Tareas", selected == BottomItem.Tasks) { onSelected(BottomItem.Tasks) }
        NavItem(Icons.Filled.CalendarMonth, "Calendario", selected == BottomItem.Calendar) { onSelected(BottomItem.Calendar) }
        NavItem(Icons.Filled.Person, "Perfil", selected == BottomItem.Profile) { onSelected(BottomItem.Profile) }
    }
}

@Composable
private fun RowScope.NavItem(
    icon: ImageVector,
    label: String,
    selected: Boolean,
    onClick: () -> Unit
) {
    NavigationBarItem(
        selected = selected,
        onClick = onClick,
        icon = { Icon(icon, contentDescription = label) },
        label = { Text(label) }
    )
}
