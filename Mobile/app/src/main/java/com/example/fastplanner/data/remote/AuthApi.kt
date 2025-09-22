package com.example.fastplanner.data.remote


import retrofit2.http.Body
import retrofit2.http.POST

interface AuthApi {
    @POST("api/auth/login")
    suspend fun login(@Body body: LoginReq): AuthResponse

    @POST("api/auth/register")
    suspend fun register(@Body body: RegisterReq): AuthResponse
}
