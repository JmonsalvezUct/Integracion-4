package com.example.fastplanner.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Lock
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp

import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation

import com.example.fastplanner.data.AuthPrefs
import com.example.fastplanner.data.remote.ApiClient
//import com.example.fastplanner.data.remote.HttpClient
import com.example.fastplanner.data.remote.RegisterReq
import kotlinx.coroutines.launch

import android.util.Log
import retrofit2.HttpException
import java.io.IOException

@Composable
fun RegistroScreen(
    onRegisterSuccess: () -> Unit = {},
    onBackToLogin: () -> Unit = {}
) {
    var name by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var pass by remember { mutableStateOf("") }

    val ctx = LocalContext.current
    val scope = rememberCoroutineScope()
    var loading by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.primary)
            .padding(20.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(28.dp))
                .background(MaterialTheme.colorScheme.surface)
                .padding(horizontal = 20.dp, vertical = 24.dp)
                .align(Alignment.Center),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text("Crear cuenta", style = MaterialTheme.typography.titleLarge)
            Spacer(Modifier.height(16.dp))

            OutlinedTextField(
                value = name,
                onValueChange = { name = it },
                label = { Text("Nombre") },
                leadingIcon = { Icon(Icons.Outlined.Person, contentDescription = null) },
                singleLine = true,
                keyboardOptions = KeyboardOptions(
                    keyboardType = KeyboardType.Text,
                    imeAction = ImeAction.Next
                ),
                shape = RoundedCornerShape(50),
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(Modifier.height(12.dp))

            OutlinedTextField(
                value = email,
                onValueChange = { email = it },
                label = { Text("Correo") },
                leadingIcon = { Icon(Icons.Outlined.Person, contentDescription = null) },
                singleLine = true,
                keyboardOptions = KeyboardOptions(
                    keyboardType = KeyboardType.Email,
                    imeAction = ImeAction.Next
                ),
                shape = RoundedCornerShape(50),
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(Modifier.height(12.dp))

            OutlinedTextField(
                value = pass,
                onValueChange = { pass = it },
                label = { Text("Contraseña") },
                leadingIcon = { Icon(Icons.Outlined.Lock, contentDescription = null) },
                singleLine = true,
                keyboardOptions = KeyboardOptions(
                    keyboardType = KeyboardType.Password,
                    imeAction = ImeAction.Done
                ),
                visualTransformation = PasswordVisualTransformation(),
                shape = RoundedCornerShape(50),
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(Modifier.height(16.dp))

            Button(
                onClick = {
                    scope.launch {
                        if (name.isBlank() || email.isBlank() || pass.isBlank()) {
                            error = "Completa nombre, correo y contraseña."
                            return@launch
                        }
                        try {
                            loading = true
                            error = null

                            val res = ApiClient.apiService.register(
                                RegisterReq(name.trim(), email.trim(), pass)
                            )

                            Log.d("REGISTER", "OK -> access=${res.accessToken.take(6)}***")
                            AuthPrefs.saveTokens(ctx, res.accessToken, res.refreshToken)
                            onRegisterSuccess()

                        } catch (e: HttpException) {
                            val code = e.code()
                            val body = e.response()?.errorBody()?.string()
                            Log.e("REGISTER", "HTTP $code -> $body", e)
                            error = "HTTP $code: ${body ?: e.message()}"

                        } catch (e: IOException) {
                            Log.e("REGISTER", "Network error", e)
                            error = "Sin conexión o timeout."

                        } catch (e: Exception) {
                            Log.e("REGISTER", "Unexpected", e)
                            error = "Error inesperado: ${e.message}"
                        } finally {
                            loading = false
                        }
                    }
                },
                enabled = !loading,
                shape = RoundedCornerShape(50),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(44.dp)
            ) {
                Text(if (loading) "Creando cuenta..." else "Registrarme")
            }

            if (error != null) {
                Spacer(Modifier.height(8.dp))
                Text(
                    text = error!!,
                    color = MaterialTheme.colorScheme.error,
                    style = MaterialTheme.typography.bodyMedium
                )
            }

            Spacer(Modifier.height(12.dp))
            TextButton(onClick = onBackToLogin) { Text("Volver a iniciar sesión") }
        }
    }
}




