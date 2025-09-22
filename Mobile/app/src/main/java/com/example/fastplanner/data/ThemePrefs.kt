package com.example.fastplanner.data

import android.content.Context
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

// Nombre del archivo de preferencias
private const val DATASTORE_NAME = "user_prefs"

// Extension del Context: DataStore de tipo Preferences (debe estar a nivel de archivo)
val Context.dataStore by preferencesDataStore(name = DATASTORE_NAME)

// Claves que usaremos
private object Keys {
    val DARK_MODE = booleanPreferencesKey("dark_mode_enabled")
}

// Repositorio sencillo para leer/escribir el modo oscuro
class ThemeRepository(private val context: Context) {

    // Flow<Boolean> con el valor actual (false = claro por defecto)
    val isDarkMode: Flow<Boolean> =
        context.dataStore.data.map { prefs ->
            prefs[Keys.DARK_MODE] ?: false
        }

    // Guardar nuevo valor
    suspend fun setDarkMode(enabled: Boolean) {
        context.dataStore.edit { prefs ->
            prefs[Keys.DARK_MODE] = enabled
        }
    }
}
