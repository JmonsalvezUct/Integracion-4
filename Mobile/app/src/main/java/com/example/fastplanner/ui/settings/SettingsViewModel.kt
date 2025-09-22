package com.example.fastplanner.ui.settings

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.fastplanner.data.ThemeRepository
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

/**
 * ViewModel para exponer y modificar la preferencia de tema (claro/oscuro).
 * Se apoya en ThemeRepository (DataStore).
 */
class SettingsViewModel(private val repo: ThemeRepository) : ViewModel() {

    // Estado observable por Compose. false = modo claro por defecto.
    val isDarkMode: StateFlow<Boolean> =
        repo.isDarkMode.stateIn(
            scope = viewModelScope,
            started = SharingStarted.Eagerly,
            initialValue = false
        )

    fun setDarkMode(enabled: Boolean) {
        viewModelScope.launch {
            repo.setDarkMode(enabled)
        }
    }

    companion object {
        /**
         * Factory para crear el ViewModel con un contexto seguro (ApplicationContext).
         */
        fun provideFactory(appContext: Context): ViewModelProvider.Factory =
            object : ViewModelProvider.Factory {
                @Suppress("UNCHECKED_CAST")
                override fun <T : ViewModel> create(modelClass: Class<T>): T {
                    return SettingsViewModel(ThemeRepository(appContext)) as T
                }
            }
    }
}
