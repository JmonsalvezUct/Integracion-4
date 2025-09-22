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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.fastplanner.ui.settings.SettingsViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PerfilScreen(
    onBottomNavSelected: (BottomItem) -> Unit,
    onBack: () -> Unit = {},
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
                            tint = MaterialTheme.colorScheme.onPrimary
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    navigationIconContentColor = MaterialTheme.colorScheme.onPrimary
                )
            )
        },
        bottomBar = {
            AppBottomBar(
                selected = BottomItem.Profile,
                onSelected = onBottomNavSelected
            )
        },
        // el header “morado” ahora viene del tema (cambia con claro/oscuro)
        containerColor = MaterialTheme.colorScheme.primary
    ) { inner ->
        Column(
            modifier = Modifier
                .padding(inner)
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.primary)
        ) {
            Surface(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(topStart = 28.dp, topEnd = 28.dp),
                color = MaterialTheme.colorScheme.surface
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(MaterialTheme.colorScheme.surface)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            // antes: ContentBgColor -> ahora background del tema
                            .background(MaterialTheme.colorScheme.background)
                            .padding(horizontal = 20.dp, vertical = 24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        // Avatar
                        Box(
                            modifier = Modifier
                                .size(84.dp)
                                .clip(CircleShape)
                                // antes: lila fijo -> ahora primaryContainer del tema
                                .background(MaterialTheme.colorScheme.primaryContainer),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Filled.Person,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.primary,
                                modifier = Modifier.size(44.dp)
                            )
                        }
                        Spacer(Modifier.height(16.dp))
                        Text(
                            text = "Jonatan Saldivia",
                            color = MaterialTheme.colorScheme.onSurface,
                            fontSize = 18.sp
                        )
                        Spacer(Modifier.height(4.dp))
                        Text(
                            text = "jsaldivia@gmail.com",
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            fontSize = 14.sp
                        )

                        Spacer(Modifier.height(24.dp))

                        // --- Lista de opciones ---
                        PreferenceRow(Icons.Filled.Notifications, "Notificaciones")
                        HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)

                        DarkModePreference(settingsVm = settingsVm)
                        HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)

                        PreferenceRow(Icons.Filled.Settings, "Configuraciones")
                        HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)

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
        Box(Modifier.size(24.dp), contentAlignment = Alignment.Center) {
            Icon(icon, contentDescription = null, tint = MaterialTheme.colorScheme.onSurface)
        }
        Spacer(Modifier.width(12.dp))
        Text(
            text = title,
            style = MaterialTheme.typography.bodyLarge,
            color = MaterialTheme.colorScheme.onSurface
        )
        Spacer(Modifier.weight(1f))
    }
}

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
            Icon(Icons.Filled.DarkMode, contentDescription = null, tint = MaterialTheme.colorScheme.onSurface)
        }
        Spacer(Modifier.width(12.dp))
        Column(Modifier.weight(1f)) {
            Text("Modo oscuro", style = MaterialTheme.typography.bodyLarge, color = MaterialTheme.colorScheme.onSurface)
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





