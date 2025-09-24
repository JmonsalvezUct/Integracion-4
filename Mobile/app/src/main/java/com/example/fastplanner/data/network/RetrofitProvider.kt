package com.example.fastplanner.data.network
import com.squareup.moshi.Moshi
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory
import retrofit2.converter.moshi.MoshiConverterFactory
import com.example.fastplanner.data.projects.ProjectsApi
import okhttp3.OkHttpClient
import retrofit2.Retrofit


object RetrofitProvider {


    fun createProjectsApi(
        baseUrl: String,
        tokenProvider: () -> String? = { null }
    ): ProjectsApi {
        val client = OkHttpClient.Builder()
            .addInterceptor(AuthInterceptor(tokenProvider))
            .build()

        val moshi = Moshi.Builder()
            .add(KotlinJsonAdapterFactory())   // 👈 necesario para data classes de Kotlin
            .build()
        return Retrofit.Builder()
            .baseUrl(baseUrl) // debe terminar en /
            .client(client)
            .addConverterFactory(MoshiConverterFactory.create(moshi)) // 👈 usa el moshi correcto
            .build()
            .create(ProjectsApi::class.java)

    }
}
