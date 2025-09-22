package com.example.fastplanner.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.ListAlt
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.Folder
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.example.fastplanner.ui.theme.ContentBgColor
import com.example.fastplanner.ui.theme.HeaderColor
import com.example.fastplanner.ui.theme.TextPrimary

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CalendarioScreen(
    onBottomNavSelected: (BottomItem) -> Unit,
    onBack: () -> Unit = {}
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Calendario", color = Color.White) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Atrás", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = HeaderColor,
                    titleContentColor = Color.White
                )
            )
        },
        bottomBar = {
            CalendarioBottomBar(
                selected = BottomItem.Calendar,
                onSelected = onBottomNavSelected
            )
        },
        containerColor = HeaderColor
    ) { inner ->
        Column(
            modifier = Modifier
                .padding(inner)
                .fillMaxSize()
                .background(HeaderColor)
        ) {
            Surface(
                modifier = Modifier.fillMaxSize(),
                shape = RoundedCornerShape(topStart = 28.dp, topEnd = 28.dp),
                color = Color.White
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(ContentBgColor)
                        .padding(16.dp)
                ) {
                    // DatePicker Material3 (demo funcional)
                    val datePickerState = rememberDatePickerState()
                    DatePicker(state = datePickerState)

                    Spacer(Modifier.height(16.dp))

                    val titulo = if (datePickerState.selectedDateMillis == null)
                        "Selecciona una fecha"
                    else
                        "Eventos para la fecha seleccionada"

                    Text(titulo, style = MaterialTheme.typography.titleMedium, color = TextPrimary)
                    Spacer(Modifier.height(8.dp))

                    // Placeholder de eventos
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Color.White, shape = RoundedCornerShape(12.dp))
                            .padding(16.dp)
                    ) {
                        Text("• (demo) Reunión de equipo — 10:00", color = TextPrimary)
                        Spacer(Modifier.height(6.dp))
                        Text("• (demo) Avance de proyecto — 15:30", color = TextPrimary)
                    }
                }
            }
        }
    }
}

@Composable
private fun CalendarioBottomBar(
    selected: BottomItem,
    onSelected: (BottomItem) -> Unit
) {
    NavigationBar {
        NavItem(Icons.Filled.Home, "Inicio", selected == BottomItem.Home) {
            onSelected(BottomItem.Home)
        }
        NavItem(Icons.Filled.Folder, "Proyectos", selected == BottomItem.Projects) {
            onSelected(BottomItem.Projects)
        }
        NavItem(Icons.AutoMirrored.Filled.ListAlt, "Tareas", selected == BottomItem.Tasks) {
            onSelected(BottomItem.Tasks)
        }
        NavItem(Icons.Filled.CalendarMonth, "Calendario", selected == BottomItem.Calendar) {
            onSelected(BottomItem.Calendar)
        }
        NavItem(Icons.Filled.Person, "Perfil", selected == BottomItem.Profile) {
            onSelected(BottomItem.Profile)
        }
    }
}

@Composable
private fun RowScope.NavItem(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
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

