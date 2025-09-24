package com.example.fastplanner.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Folder
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.ListAlt
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.fastplanner.ui.theme.ContentBgColor
import com.example.fastplanner.ui.theme.HeaderColor
import com.example.fastplanner.ui.theme.TextPrimary

// OJO: BottomItem ya está declarado en MainScreen.kt (no lo declares de nuevo aquí)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PerfilScreen(
    onBottomNavSelected: (BottomItem) -> Unit,
    onBack: () -> Unit = {}
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = {},
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Atrás",
                            tint = Color.White
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = HeaderColor,
                    navigationIconContentColor = Color.White
                )
            )
        },
        bottomBar = {
            PerfilBottomBar(
                selected = BottomItem.Profile,
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
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(topStart = 28.dp, topEnd = 28.dp),
                color = Color.White
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color.White)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(ContentBgColor)
                            .padding(horizontal = 20.dp, vertical = 24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        // Avatar
                        Box(
                            modifier = Modifier
                                .size(84.dp)
                                .clip(CircleShape)
                                .background(Color(0xFFEDEBFE)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Filled.Person,
                                contentDescription = null,
                                tint = HeaderColor,
                                modifier = Modifier.size(44.dp)
                            )
                        }
                        Spacer(Modifier.height(16.dp))
                        Text(
                            text = "Jonatan Saldivia",
                            color = TextPrimary,
                            fontSize = 18.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                        Spacer(Modifier.height(4.dp))
                        Text(
                            text = "jsaldivia@gmail.com",
                            color = Color(0xFF6B7280),
                            fontSize = 14.sp
                        )

                        Spacer(Modifier.height(24.dp))

                        PerfilRow(Icons.Filled.Notifications, "Notificaciones")
                        HorizontalDivider(thickness = 1.dp, color = Color(0xFFE5E7EB))
                        PerfilRow(Icons.Filled.Settings, "Preferencias")
                        HorizontalDivider(thickness = 1.dp, color = Color(0xFFE5E7EB))
                        PerfilRow(Icons.Filled.Settings, "Configuraciones")
                        HorizontalDivider(thickness = 1.dp, color = Color(0xFFE5E7EB))
                        PerfilRow(Icons.Filled.Share, "Colaboración")

                        Spacer(Modifier.height(24.dp))
                    }
                }
            }
        }
    }
}

@Composable
private fun PerfilRow(icon: androidx.compose.ui.graphics.vector.ImageVector, title: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 14.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(Modifier.size(24.dp), contentAlignment = Alignment.Center) { Icon(icon, contentDescription = null) }
        Spacer(Modifier.width(12.dp))
        Text(text = title, style = MaterialTheme.typography.bodyLarge, color = TextPrimary)
        Spacer(Modifier.weight(1f))
    }
}

@Composable
private fun PerfilBottomBar(
    selected: BottomItem,
    onSelected: (BottomItem) -> Unit
) {
    NavigationBar {
        NavItem(Icons.Filled.Home,   "Inicio",    selected == BottomItem.Home)     { onSelected(BottomItem.Home) }
        NavItem(Icons.Filled.Folder, "Proyectos", selected == BottomItem.Projects) { onSelected(BottomItem.Projects) }
        NavItem(Icons.Filled.ListAlt,"Tareas",    selected == BottomItem.Tasks)    { onSelected(BottomItem.Tasks) }
        NavItem(Icons.Filled.Person, "Perfil",    selected == BottomItem.Profile)  { onSelected(BottomItem.Profile) }
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









