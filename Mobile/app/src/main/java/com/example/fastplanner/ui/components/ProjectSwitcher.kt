package com.example.fastplanner.ui.components

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.foundation.layout.RowScope

// ====== UI models (evita "Unresolved reference: ProjectSwitcherState") ======
data class ProjectUi(val id: Long, val name: String)

data class ProjectSwitcherUiState(
    val loading: Boolean = false,
    val error: String? = null,
    val projects: List<ProjectUi> = emptyList(),
    val expanded: Boolean = false,
    val selected: ProjectUi? = null
)

@OptIn(ExperimentalMaterial3Api::class) // por menuAnchor/TopAppBar M3
@Composable
fun ProjectSwitcherTopBar(
    state: ProjectSwitcherUiState,
    headerColor: Color,                      // para usar tu "Header"
    onToggle: () -> Unit,
    onSelect: (ProjectUi) -> Unit,
    actions: @Composable RowScope.() -> Unit = {}     // por si quieres íconos a la derecha
) {
    TopAppBar(
        title = { Text(text = state.selected?.name ?: "") },
        navigationIcon = {
            // ANCLA el menú al ícono (si no usas menuAnchor, igual funciona bien)
            Box {
                IconButton(onClick = onToggle) {
                    Icon(Icons.Default.Menu, contentDescription = "Cambiar proyecto", tint = Color.White)
                }
                DropdownMenu(expanded = state.expanded, onDismissRequest = onToggle) {
                    when {
                        state.loading -> Text("Cargando…", modifier = Modifier.padding(12.dp))
                        state.error != null -> Text("Error: ${state.error}", modifier = Modifier.padding(12.dp))
                        else -> state.projects.forEach { p ->
                            DropdownMenuItem(
                                text = { Text(p.name) },
                                onClick = { onSelect(p) }
                            )
                        }
                    }
                }
            }
        },
        actions = actions,
        colors = TopAppBarDefaults.topAppBarColors(
            containerColor = headerColor,
            navigationIconContentColor = Color.White,
            actionIconContentColor = Color.White,
            titleContentColor = Color.White
        )
    )
}
