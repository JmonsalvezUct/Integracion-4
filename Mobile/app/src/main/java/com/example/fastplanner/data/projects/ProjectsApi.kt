package com.example.fastplanner.data.projects

import retrofit2.http.GET
import retrofit2.http.Query
interface ProjectsApi {
    @GET("projects")
    suspend fun listProjects(
        @Query("q") q: String? = null,
        @Query("sortBy") sortBy: String? = null,   // "name", "date", "activity"
        @Query("order") order: String? = null      // "asc", "desc"
    ): List<ProjectDto>
}