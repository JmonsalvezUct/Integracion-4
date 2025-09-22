package com.example.fastplanner

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.example.fastplanner.ui.screens.BottomItem
import com.example.fastplanner.ui.screens.MainScreen
import com.example.fastplanner.ui.theme.FastPlannerTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            // Tema fijo aquí para evitar dependencias de ViewModel por ahora
            FastPlannerTheme(darkTheme = false) {
                // Mostramos directamente la pantalla principal sin Navigation
                MainScreen(
                    onBottomNavSelected = { item ->
                        // TODO: más adelante reactivamos Navigation aquí
                        when (item) {
                            BottomItem.Home -> Unit
                            BottomItem.Projects -> { /* TODO */ }
                            BottomItem.Tasks -> { /* TODO */ }
                            BottomItem.Calendar -> { /* TODO */ }
                            BottomItem.Profile -> { /* TODO */ }
                        }
                    }
                )
            }
        }
    }
}







