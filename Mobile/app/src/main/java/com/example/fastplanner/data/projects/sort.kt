package com.example.fastplanner.data.projects

enum class SortBy(val param: String) { NAME("name"), DATE("date"), ACTIVITY("activity") }
enum class SortOrder(val param: String) { ASC("asc"), DESC("desc") }
data class SortOption(val by: SortBy, val order: SortOrder)
