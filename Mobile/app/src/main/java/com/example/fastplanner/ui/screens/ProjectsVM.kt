package com.example.fastplanner.ui.screens

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.fastplanner.data.projects.*
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class ProjectsUiState(
    val loading: Boolean = true,
    val error: String? = null,
    val query: String = "",
    val sort: SortOption = SortOption(SortBy.DATE, SortOrder.DESC),
    val items: List<Project> = emptyList()
)

class ProjectsVM(private val repo: ProjectsRepository) : ViewModel() {
    private val _query = MutableStateFlow("")
    private val _sort  = MutableStateFlow(SortOption(SortBy.DATE, SortOrder.DESC))
    private val _state = MutableStateFlow(ProjectsUiState())
    val state: StateFlow<ProjectsUiState> = _state.asStateFlow()

    init {
        viewModelScope.launch {
            repo.stream(_query, _sort)
                .onStart { _state.update { it.copy(loading = true, error = null) } }
                .catch { e -> _state.update { it.copy(loading = false, error = e.message) } }
                .collect { list -> _state.update { it.copy(loading = false, items = list) } }
        }
    }

    fun setQuery(q: String)   { _query.value = q; _state.update { it.copy(query = q) } }
    fun setSortBy(by: SortBy) { _sort.value = _sort.value.copy(by = by); _state.update { it.copy(sort = _sort.value) } }
    fun toggleOrder() {
        val next = if (_sort.value.order == SortOrder.ASC) SortOrder.DESC else SortOrder.ASC
        _sort.value = _sort.value.copy(order = next)
        _state.update { it.copy(sort = _sort.value) }
    }
}

class ProjectsVMFactory(private val repo: ProjectsRepository) : ViewModelProvider.Factory {
    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T = ProjectsVM(repo) as T
}
