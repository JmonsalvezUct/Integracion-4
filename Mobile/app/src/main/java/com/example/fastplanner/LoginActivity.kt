package com.example.fastplanner

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import com.example.fastplanner.ui.screens.LoginScreen  // lo crearemos en el siguiente paso

class LoginActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            MaterialTheme {
                Scaffold { innerPadding ->
                    Surface(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(innerPadding)
                    ) {
                        // Aquí se llama a la pantalla de login hecha con Compose
                        LoginScreen(
                            onLoginSuccess = {
                                // TODO: más adelante irás a HomeActivity o al NavHost
                                // startActivity(Intent(this, HomeActivity::class.java))
                                // finish()
                            },
                            onGoToRegister = {
                                // TODO: cuando creemos RegistroActivity, la abrimos aquí:
                                // startActivity(Intent(this, RegistroActivity::class.java))
                            }
                        )
                    }
                }
            }
        }
    }
}