package com.example.fastplanner

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.getValue
import androidx.compose.ui.platform.LocalContext
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.fastplanner.ui.screens.RegistroScreen
import com.example.fastplanner.ui.settings.SettingsViewModel
import com.example.fastplanner.ui.theme.FastPlannerTheme

class RegistroActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            // Lee el modo (claro/oscuro) desde DataStore
            val appCtx = LocalContext.current.applicationContext
            val settingsVm: SettingsViewModel = viewModel(
                factory = SettingsViewModel.provideFactory(appCtx)
            )
            val isDark by settingsVm.isDarkMode.collectAsStateWithLifecycle()

            // Aplica tu tema con el modo actual
            FastPlannerTheme(darkTheme = isDark) {
                RegistroScreen(
                    onRegister = {
                        // TODO: navegar a Home o volver al Login, según tu flujo
                        // finish()
                    }
                )
            }
        }
    }
}
