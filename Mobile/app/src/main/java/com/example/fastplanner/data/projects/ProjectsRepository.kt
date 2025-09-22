package com.example.fastplanner.data.projects

import kotlinx.coroutines.currentCoroutineContext
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.isActive

class ProjectsRepository(private val api: ProjectsApi) {
    suspend fun fetch(q: String?, sort: SortOption): List<Project> =
        api.listProjects(
            q = q,
            sortBy = sort.by.param,
            order = sort.order.param
        ).map { it.toDomain() }

    suspend fun fetchAll(): List<Project> =
        fetch(q = null, sort = SortOption(SortBy.DATE, SortOrder.DESC))
    fun stream(
        qFlow: StateFlow<String>,
        sortFlow: StateFlow<SortOption>,
        periodMs: Long = 10_000L
    ): Flow<List<Project>> =
        combine(qFlow, sortFlow) { q, sort -> q to sort }
            .flatMapLatest { (q, sort) ->
                flow {
                    emit(fetch(q.takeIf { !it.isNullOrBlank() }, sort))
                    while (currentCoroutineContext().isActive) {
                        delay(periodMs)
                        emit(fetch(q.takeIf { !it.isNullOrBlank() }, sort))
                    }
                }
            }
}