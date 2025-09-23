package com.example.fastplanner.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ListAlt
import androidx.compose.material.icons.filled.ArrowDownward
import androidx.compose.material.icons.filled.ArrowUpward
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.Folder
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.fastplanner.data.projects.Project
import com.example.fastplanner.data.projects.ProjectsRepository
import com.example.fastplanner.data.projects.SortBy
import com.example.fastplanner.data.projects.SortOrder
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.material.icons.filled.Menu

import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeFormatter
fun formatDate(iso: String): String {
    return try {
        val instant = Instant.parse(iso)
        val formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy")
            .withZone(ZoneId.systemDefault())
        formatter.format(instant)
    } catch (e: Exception) {
        iso
    }
}
@OptIn(ExperimentalMaterial3Api::class)
@Composable

fun ProjectsScreen(
    projectsRepo: ProjectsRepository,
    onAddProject: () -> Unit = {},
    onProjectClick: (Project) -> Unit = {},
    onBottomNavSelected: (BottomItem) -> Unit = {}
)

{
    val vm: ProjectsVM = viewModel(factory = ProjectsVMFactory(projectsRepo))
    val st by vm.state.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Proyectos") },
                navigationIcon = {
                    IconButton(onClick = { /* abrir drawer o menú */ }) {
                        Icon(Icons.Filled.Menu, contentDescription = "Menú")
                    }
                }
            )
        },


        floatingActionButton = { FloatingActionButton(onClick = onAddProject) { Text("+") } },
        bottomBar = {
            CalendarioBottomBar(
                selected = BottomItem.Projects,
                onSelected = onBottomNavSelected
            )
        },
    ) { inner ->
        Column(Modifier.padding(inner).fillMaxSize()) {

            // Buscar
            OutlinedTextField(
                value = st.query,
                onValueChange = vm::setQuery,
                placeholder = { Text("Buscar proyectos…") },
                singleLine = true,
                shape = RoundedCornerShape(24.dp),
                modifier = Modifier
                    .padding(16.dp)
                    .fillMaxWidth()
            )


            Row(
                modifier = Modifier.padding(horizontal = 16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                FilterChip(
                    selected = st.sort.by == SortBy.NAME,
                    onClick = { vm.setSortBy(SortBy.NAME) },
                    label = { Text("Nombre") }
                )
                Spacer(Modifier.width(8.dp))
                FilterChip(
                    selected = st.sort.by == SortBy.DATE,
                    onClick = { vm.setSortBy(SortBy.DATE) },
                    label = { Text("Fecha") }
                )
                Spacer(Modifier.width(8.dp))
                FilterChip(
                    selected = st.sort.by == SortBy.ACTIVITY,
                    onClick = { vm.setSortBy(SortBy.ACTIVITY) },
                    label = { Text("Actividad") }
                )
                Spacer(Modifier.weight(1f))
                IconButton(onClick = vm::toggleOrder) {
                    val up = st.sort.order == SortOrder.ASC
                    Icon(
                        if (up) Icons.Filled.ArrowUpward else Icons.Filled.ArrowDownward,
                        contentDescription = if (up) "Ascendente" else "Descendente"
                    )
                }
            }

            Spacer(Modifier.height(8.dp))

            // Contenido
            when {
                st.loading -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator()
                }
                st.error != null -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text("Error: ${st.error}")
                }
                st.items.isEmpty() -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text("No hay proyectos")
                }
                else -> LazyColumn(
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(st.items, key = { it.id }) { p ->
                        ProjectCard(project = p, onClick = { onProjectClick(p) })
                    }
                }
            }
        }
    }
}

@Composable
private fun ProjectCard(project: Project, onClick: () -> Unit) {
    Surface(
        onClick = onClick,
        shape = RoundedCornerShape(16.dp),
        color = Color(0xFFF1F5F9),
        modifier = Modifier
            .fillMaxWidth()
            .heightIn(min = 90.dp)
    ) {
        Column(Modifier.padding(16.dp)) {
            Text(project.name, style = MaterialTheme.typography.titleMedium)
            Spacer(Modifier.height(6.dp))
            Text("Actividad: ${project.activity}", style = MaterialTheme.typography.bodySmall)
            Spacer(Modifier.height(4.dp))
            Text(
                "Creado: ${formatDate(project.createdAt)}",
                style = MaterialTheme.typography.bodySmall,
                color = Color(0xFF64748B)
            )
        }
    }
}
//---------------------botombar-------------

@Composable
private fun CalendarioBottomBar(
    selected: BottomItem,
    onSelected: (BottomItem) -> Unit
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
