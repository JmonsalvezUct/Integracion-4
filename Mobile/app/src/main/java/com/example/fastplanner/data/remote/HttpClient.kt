package com.example.fastplanner.data.remote



import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.moshi.MoshiConverterFactory

object HttpClient {
    // Emulador Android → llega al localhost de tu PC
    private const val BASE_URL = "http://10.0.2.2:3000/"

    private val okHttp = OkHttpClient.Builder().build()

    val auth: AuthApi by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(okHttp)
            .addConverterFactory(MoshiConverterFactory.create())
            .build()
            .create(AuthApi::class.java)
    }
}
