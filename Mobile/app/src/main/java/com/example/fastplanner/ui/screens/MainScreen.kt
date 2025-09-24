package com.example.fastplanner.ui.screens
import androidx.compose.material.icons.filled.Menu
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ListAlt
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.Folder
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

// imports:
import com.example.fastplanner.ui.components.ProjectSwitcherTopBar
import com.example.fastplanner.ui.components.ProjectSwitcherUiState
import com.example.fastplanner.ui.components.ProjectUi
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.fastplanner.data.projects.ProjectsRepository
import com.example.fastplanner.ui.screens.ProjectSwitcherViewModel
import com.example.fastplanner.ui.screens.ProjectSwitcherVMFactory

// Data para los tableros
data class BoardUi(val id: String, val title: String, val activitiesCount: Int, val color: Color)

// Colores temporales (pueden venir de color.kt)
private val Blue = Color(0xFF2F8BFF)
private val Green = Color(0xFF4BC19D)
private val Pink = Color(0xFFF06AB1)
private val Red  = Color(0xFFEF6A6A)
private val Header = Color(0xFF3E21FF)
private val ContentBg = Color(0xFFF1F5F9)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen(
    projectsRepo: ProjectsRepository,
    onProjectChanged: (Long) -> Unit,
    onOpenDrawer: () -> Unit = {},
    onBoardClick: (BoardUi) -> Unit = {},
    onCreateBoardClick: () -> Unit = {},
    onBottomNavSelected: (BottomItem) -> Unit = {}
) {
    val switcherVm: ProjectSwitcherViewModel = viewModel(
        factory = ProjectSwitcherVMFactory(projectsRepo, onProjectChanged)
    )
    val ps by switcherVm.state.collectAsState()

    LaunchedEffect(Unit) { switcherVm.load()}
    var query by remember { mutableStateOf("") }
    val boards = remember {
        listOf(
            BoardUi("1", "Marketing", 3, Blue),
            BoardUi("2", "Investigación", 2, Green),
            BoardUi("3", "Desarrollo", 5, Pink),
            BoardUi("4", "Estadística", 1, Red),
        )
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = ps.selected?.name ?: "",
                        color = Color.White
                    )
                },
                navigationIcon = {
                    Box {
                        IconButton(onClick = { switcherVm.toggleMenu() }) {
                            Icon(
                                Icons.Filled.Menu,            // <--- hamburguesa
                                contentDescription = "Menú",
                                tint = Color.White
                            )
                        }

                        DropdownMenu(
                            expanded = ps.expanded,
                            onDismissRequest = { switcherVm.toggleMenu() }
                        ) {
                            when {
                                ps.loading -> Text("Cargando...", modifier = Modifier.padding(12.dp))
                                ps.error != null -> Text("Error: ${ps.error}", modifier = Modifier.padding(12.dp))
                                else -> ps.projects.forEach { p ->
                                    DropdownMenuItem(
                                        text = { Text(p.name) },
                                        onClick = { switcherVm.select(p) }
                                    )
                                }
                            }
                        }
                    }
                },
                actions = {
                    IconButton(onClick = { }) {
                        Icon(Icons.Default.Person, contentDescription = "Perfil", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Header,
                    navigationIconContentColor = Color.White,
                    actionIconContentColor = Color.White
                )
            )
        },

        bottomBar = { MainBottomBar(BottomItem.Home, onBottomNavSelected) },
        containerColor = Header
    ) { inner ->
        Column(
            modifier = Modifier
                .padding(inner)
                .fillMaxSize()
                .background(Header)
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(topStart = 28.dp, topEnd = 28.dp))
                    .background(Color.White)
            ) {
                Column(Modifier.fillMaxSize()) {
                    Spacer(Modifier.height(16.dp))
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp),
                        horizontalArrangement = Arrangement.Center
                    ) {
                        OutlinedTextField(
                            value = query,
                            onValueChange = { query = it },
                            leadingIcon = { Icon(Icons.Default.Home, null) },
                            placeholder = { Text("buscar …") },
                            singleLine = true,
                            shape = RoundedCornerShape(24.dp),
                            modifier = Modifier.fillMaxWidth()
                        )
                    }

                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .background(ContentBg)
                            .padding(horizontal = 16.dp)
                    ) {
                        Spacer(Modifier.height(16.dp))
                        Text(
                            text = "Tableros",
                            style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.SemiBold),
                            color = Color(0xFF0F172A)
                        )
                        Spacer(Modifier.height(12.dp))

                        LazyVerticalGrid(
                            modifier = Modifier.weight(1f),
                            columns = GridCells.Fixed(2),
                            verticalArrangement = Arrangement.spacedBy(12.dp),
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            items(boards) { b -> BoardCard(b) { onBoardClick(b) } }
                            item { CreateBoardCard(onCreateBoardClick) }
                        }

                        Spacer(Modifier.height(12.dp))
                    }
                }
            }
        }
    }
}

@Composable
private fun BoardCard(board: BoardUi, onClick: () -> Unit) {
    Surface(
        onClick = onClick,
        shape = RoundedCornerShape(18.dp),
        color = board.color,
        modifier = Modifier.height(110.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(14.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Text(
                text = board.title,
                color = Color.White,
                fontSize = 18.sp,
                fontWeight = FontWeight.SemiBold,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
            Text(
                text = "${board.activitiesCount} Actividades",
                color = Color(0xFFE6F1FF),
                fontSize = 13.sp
            )
        }
    }
}

@Composable
private fun CreateBoardCard(onClick: () -> Unit) {
    Surface(
        onClick = onClick,
        shape = RoundedCornerShape(18.dp),
        color = Color.Transparent,
        border = BorderStroke(2.dp, Color(0xFFCBD5E1)),
        modifier = Modifier.height(110.dp)
    ) {
        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.Home, contentDescription = null)
                Spacer(Modifier.width(8.dp))
                Text(text = "crear tablero", fontWeight = FontWeight.Medium)
            }
        }
    }
}

@Composable
private fun MainBottomBar(selected: BottomItem, onSelected: (BottomItem) -> Unit) {
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







