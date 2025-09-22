package com.example.fastplanner

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.example.fastplanner.ui.screens.LoginScreen
import com.example.fastplanner.ui.theme.FastPlannerTheme

class LoginActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            // Login NO responde al toggle de tema: se fuerza claro aquí
            FastPlannerTheme(darkTheme = false) {
                LoginScreen(
                    onLogin = {
                        // Navega a la pantalla principal tras login exitoso
                        startActivity(Intent(this@LoginActivity, MainActivity::class.java))
                        finish() // evita volver con "atrás"
                    },
                    onGoRegister = {
                        // Ir a la pantalla de registro
                        startActivity(Intent(this@LoginActivity, RegistroActivity::class.java))
                    }
                )
            }
        }
    }
}


