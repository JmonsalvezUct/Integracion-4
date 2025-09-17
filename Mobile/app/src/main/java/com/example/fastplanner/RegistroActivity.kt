package com.example.fastplanner

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
            FastPlannerTheme {
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