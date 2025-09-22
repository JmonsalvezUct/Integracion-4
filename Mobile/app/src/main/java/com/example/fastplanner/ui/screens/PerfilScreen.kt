package com.example.fastplanner.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.DarkMode
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.fastplanner.ui.settings.SettingsViewModel
import com.example.fastplanner.ui.theme.ContentBgColor
import com.example.fastplanner.ui.theme.HeaderColor
import com.example.fastplanner.ui.theme.TextPrimary

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PerfilScreen(
    onBottomNavSelected: (BottomItem) -> Unit,
    onBack: () -> Unit = {},
    // ← Añadimos el VM para el switch
    settingsVm: SettingsViewModel
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
        // Barra inferior unificada del proyecto
        bottomBar = {
            AppBottomBar(
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

                        // --- Lista de opciones ---
                        PreferenceRow(Icons.Filled.Notifications, "Notificaciones")
                        HorizontalDivider(thickness = 1.dp, color = Color(0xFFE5E7EB))

                        // Preferencias: Modo oscuro (Switch)
                        DarkModePreference(settingsVm = settingsVm)
                        HorizontalDivider(thickness = 1.dp, color = Color(0xFFE5E7EB))

                        PreferenceRow(Icons.Filled.Settings, "Configuraciones")
                        HorizontalDivider(thickness = 1.dp, color = Color(0xFFE5E7EB))

                        PreferenceRow(Icons.Filled.Share, "Colaboración")

                        Spacer(Modifier.height(24.dp))
                    }
                }
            }
        }
    }
}

@Composable
private fun PreferenceRow(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    title: String
) {
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

/** Preferencia: Modo oscuro (con switch) */
@Composable
private fun DarkModePreference(
    settingsVm: SettingsViewModel,
    modifier: Modifier = Modifier
) {
    val isDark by settingsVm.isDarkMode.collectAsStateWithLifecycle()

    Row(
        modifier = modifier
            .fillMaxWidth()
            .clickable { settingsVm.setDarkMode(!isDark) }
            .padding(vertical = 14.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(Modifier.size(24.dp), contentAlignment = Alignment.Center) {
            Icon(Icons.Filled.DarkMode, contentDescription = null)
        }
        Spacer(Modifier.width(12.dp))
        Column(Modifier.weight(1f)) {
            Text("Modo oscuro", style = MaterialTheme.typography.bodyLarge, color = TextPrimary)
            Text(
                if (isDark) "Activado" else "Desactivado",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
        Switch(
            checked = isDark,
            onCheckedChange = { checked -> settingsVm.setDarkMode(checked) }
        )
    }
}




