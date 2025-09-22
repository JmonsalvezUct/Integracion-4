package com.example.fastplanner.data

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

// DataStore específico para auth (tokens)
val Context.authDataStore by preferencesDataStore(name = "auth_prefs")

object AuthPrefs {
    private val KEY_ACCESS = stringPreferencesKey("access_token")
    private val KEY_REFRESH = stringPreferencesKey("refresh_token")

    suspend fun saveTokens(context: Context, accessToken: String, refreshToken: String) {
        context.authDataStore.edit { prefs ->
            prefs[KEY_ACCESS] = accessToken
            prefs[KEY_REFRESH] = refreshToken
        }
    }

    fun accessTokenFlow(context: Context): Flow<String?> =
        context.authDataStore.data.map { it[KEY_ACCESS] }

    fun refreshTokenFlow(context: Context): Flow<String?> =
        context.authDataStore.data.map { it[KEY_REFRESH] }

    suspend fun clear(context: Context) {
        context.authDataStore.edit { prefs ->
            prefs.remove(KEY_ACCESS)
            prefs.remove(KEY_REFRESH)
        }
    }
}
