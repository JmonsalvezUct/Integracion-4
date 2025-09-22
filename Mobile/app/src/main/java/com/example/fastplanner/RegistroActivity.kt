package com.example.fastplanner

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.example.fastplanner.ui.screens.RegistroScreen
import com.example.fastplanner.ui.theme.FastPlannerTheme

class RegistroActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            // Pantalla de registro fija en tema claro (no depende del botón claro/oscuro)
            FastPlannerTheme(darkTheme = false) {
                RegistroScreen(
                    onRegisterSuccess = {
                        startActivity(Intent(this@RegistroActivity, MainActivity::class.java))
                        finish()
                    },
                    onBackToLogin = {
                        finish()
                    }
                )
            }
        }
    }
}




