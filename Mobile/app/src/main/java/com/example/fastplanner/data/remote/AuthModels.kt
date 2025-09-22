package com.example.fastplanner.data.remote


data class LoginReq(val email: String, val password: String)
data class RegisterReq(
    val name: String,
    val email: String,
    val password: String,
    val profilePicture: String? = null
)

data class UserDto(val id: Int, val name: String, val email: String, val profilePicture: String?)
data class AuthResponse(val accessToken: String, val refreshToken: String, val user: UserDto)