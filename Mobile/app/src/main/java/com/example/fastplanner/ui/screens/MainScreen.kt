package com.example.fastplanner.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountCircle
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material.icons.filled.Search
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
import com.example.fastplanner.ui.theme.BoardBlue
import com.example.fastplanner.ui.theme.BoardGreen
import com.example.fastplanner.ui.theme.BoardPink
import com.example.fastplanner.ui.theme.BoardRed

data class BoardUi(val id: String, val title: String, val activitiesCount: Int, val color: Color)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen(
    onOpenDrawer: () -> Unit = {},
    onBoardClick: (BoardUi) -> Unit = {},
    onCreateBoardClick: () -> Unit = {},
    onBottomNavSelected: (BottomItem) -> Unit = {}
) {
    var query by remember { mutableStateOf("") }

    val boards = remember {
        listOf(
            BoardUi("1", "Marketing", 3, BoardBlue),
            BoardUi("2", "Investigación", 2, BoardGreen),
            BoardUi("3", "Desarrollo", 5, BoardPink),
            BoardUi("4", "Estadística", 1, BoardRed),
        )
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {},
                navigationIcon = {
                    IconButton(onClick = onOpenDrawer) {
                        Icon(
                            Icons.Filled.Menu,
                            contentDescription = "Menú",
                            tint = MaterialTheme.colorScheme.onPrimary
                        )
                    }
                },
                actions = {
                    IconButton(onClick = { /* abrir perfil */ }) {
                        Icon(
                            Icons.Filled.AccountCircle,
                            contentDescription = "Perfil",
                            tint = MaterialTheme.colorScheme.onPrimary
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    navigationIconContentColor = MaterialTheme.colorScheme.onPrimary,
                    actionIconContentColor = MaterialTheme.colorScheme.onPrimary
                )
            )
        },
        // barra inferior unificada
        bottomBar = {
            AppBottomBar(
                selected = BottomItem.Home,
                onSelected = onBottomNavSelected
            )
        },
        // header/background superior (morado en claro, tono en oscuro)
        containerColor = MaterialTheme.colorScheme.primary
    ) { inner ->
        Column(
            modifier = Modifier
                .padding(inner)
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.primary)
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(topStart = 28.dp, topEnd = 28.dp))
                    .background(MaterialTheme.colorScheme.surface)
            ) {
                Column(Modifier.fillMaxSize()) {
                    Spacer(Modifier.height(16.dp))

                    // BUSCADOR
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp),
                        horizontalArrangement = Arrangement.Center
                    ) {
                        OutlinedTextField(
                            value = query,
                            onValueChange = { query = it },
                            leadingIcon = {
                                Icon(
                                    Icons.Filled.Search,
                                    contentDescription = "Buscar",
                                    tint = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            },
                            placeholder = { Text("buscar …") },
                            singleLine = true,
                            shape = RoundedCornerShape(24.dp),
                            modifier = Modifier.fillMaxWidth()
                        )
                    }

                    // CONTENIDO
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .background(MaterialTheme.colorScheme.background)
                            .padding(horizontal = 16.dp)
                    ) {
                        Spacer(Modifier.height(16.dp))
                        Text(
                            text = "Tableros",
                            style = MaterialTheme.typography.headlineSmall.copy(
                                fontWeight = FontWeight.SemiBold
                            ),
                            color = MaterialTheme.colorScheme.onSurface
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
    // Mantengo el color propio del tablero, pero uso contentColor blanco para buen contraste
    Surface(
        onClick = onClick,
        shape = RoundedCornerShape(18.dp),
        color = board.color,
        contentColor = Color.White,
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
        border = BorderStroke(2.dp, MaterialTheme.colorScheme.outlineVariant),
        modifier = Modifier.height(110.dp)
    ) {
        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    Icons.Filled.Add,
                    contentDescription = "Crear tablero",
                    tint = MaterialTheme.colorScheme.onSurface
                )
                Spacer(Modifier.width(8.dp))
                Text(
                    text = "crear tablero",
                    fontWeight = FontWeight.Medium,
                    color = MaterialTheme.colorScheme.onSurface
                )
            }
        }
    }
}






