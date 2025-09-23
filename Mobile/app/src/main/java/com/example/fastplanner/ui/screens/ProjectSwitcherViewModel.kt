package com.example.fastplanner.ui.screens

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.fastplanner.data.projects.ProjectsRepository
import com.example.fastplanner.ui.components.ProjectSwitcherUiState
import com.example.fastplanner.ui.components.ProjectUi
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class ProjectSwitcherViewModel(
    private val repo: ProjectsRepository,
    private val onProjectChanged: (Long) -> Unit
) : ViewModel() {

    private val _state = MutableStateFlow(ProjectSwitcherUiState(loading = true))
    val state: StateFlow<ProjectSwitcherUiState> = _state

    fun load() {
        _state.value = _state.value.copy(loading = true, error = null)
        viewModelScope.launch {
            try {
                val projects = repo.fetchAll().map { p -> ProjectUi(p.id, p.name) }

                val selected = _state.value.selected ?: projects.firstOrNull()
                _state.value = _state.value.copy(
                    loading = false,
                    projects = projects,
                    selected = selected
                )
                selected?.let { onProjectChanged(it.id) }
            } catch (e: Exception) {
                _state.value = _state.value.copy(loading = false, error = e.message)
            }
        }
    }

    fun toggleMenu() {
        _state.value = _state.value.copy(expanded = !_state.value.expanded)
    }

    fun select(project: ProjectUi) {
        _state.value = _state.value.copy(selected = project, expanded = false)
        onProjectChanged(project.id)
    }
}


class ProjectSwitcherVMFactory(
    private val repo: ProjectsRepository,
    private val onProjectChanged: (Long) -> Unit
) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        @Suppress("UNCHECKED_CAST")
        return ProjectSwitcherViewModel(repo, onProjectChanged) as T
    }
}
