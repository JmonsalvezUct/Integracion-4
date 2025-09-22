package com.example.fastplanner.data.projects

data class ProjectDto(
    val id: Long,
    val name: String,
    val createdAt: String,
    val activity: Int
)

data class Project(
    val id: Long,
    val name: String,
    val activity: Int,
    val createdAt: String
)

fun ProjectDto.toDomain() = Project(
    id = id,
    name = name,
    activity = activity,
    createdAt = createdAt
)
