package com.example.fastplanner.data.projects

data class ProjectDto(
    val id: Long,
    val name: String,
    val createdAt: String, // ISO 8601
    val activity: Int
)

data class Project(
    val id: Long,
    val name: String,
    val activity: Int,
    val createdAt: String   // 👈 esta es la que usas en ProjectCard -> formatDate(project.createdAt)
)

fun ProjectDto.toDomain() = Project(
    id = id,
    name = name,
    activity = activity,
    createdAt = createdAt
)
