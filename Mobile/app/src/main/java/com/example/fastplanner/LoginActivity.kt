package com.example.fastplanner

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.getValue
import androidx.compose.ui.platform.LocalContext
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.fastplanner.ui.screens.LoginScreen
import com.example.fastplanner.ui.settings.SettingsViewModel
import com.example.fastplanner.ui.theme.FastPlannerTheme

class LoginActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            // Obtener el valor de modo oscuro desde DataStore
            val appCtx = LocalContext.current.applicationContext
            val settingsVm: SettingsViewModel = viewModel(
                factory = SettingsViewModel.provideFactory(appCtx)
            )
            val isDark by settingsVm.isDarkMode.collectAsStateWithLifecycle()

            // Pasar el booleano al tema
            FastPlannerTheme(darkTheme = isDark) {
                LoginScreen(
                    onLogin = {
                        // TODO: navegar a Home cuando lo tengas listo
                    },
                    onGoRegister = {
                        startActivity(Intent(this, RegistroActivity::class.java))
                    }
                )
            }
        }
    }
}
