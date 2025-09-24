plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    // Usas Compose con Kotlin 2.x (plugin de Compose)
    id("org.jetbrains.kotlin.plugin.compose")
}

android {
    namespace = "com.example.fastplanner"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.example.fastplanner"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables.useSupportLibrary = true
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    // Compose ON
    buildFeatures {
        compose = true
    }

    // Java/Kotlin 17
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }

    // Evita conflictos de licencias
    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    // ===== Compose BOM (recomendado para no poner versiones en cada módulo) =====
    implementation(platform("androidx.compose:compose-bom:2024.08.00"))
    androidTestImplementation(platform("androidx.compose:compose-bom:2024.08.00"))

    // --- Compose base ---
    implementation("androidx.activity:activity-compose:1.9.2")
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.4")

    // Herramientas de depuración Compose
    debugImplementation("androidx.compose.ui:ui-tooling")
    debugImplementation("androidx.compose.ui:ui-test-manifest")
    //  Retrofit + Moshi + OkHttp
    implementation("com.squareup.retrofit2:retrofit:2.11.0")
    implementation("com.squareup.retrofit2:converter-moshi:2.11.0")
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")
    implementation("com.squareup.moshi:moshi-kotlin:1.15.1")
    // Tests
    androidTestImplementation("androidx.compose.ui:ui-test-junit4")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.6.1")

    // --- DataStore + Lifecycle ---
    implementation("androidx.datastore:datastore-preferences:1.1.1")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.4")
    implementation("androidx.lifecycle:lifecycle-viewmodel-ktx:2.8.4")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.8.4")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.4") // <- AÑADIDO

    // --- Coroutines ---
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.1")

    // --- Red (Retrofit + OkHttp + Moshi) ---
    implementation("com.squareup.retrofit2:retrofit:2.11.0")
    implementation("com.squareup.retrofit2:converter-moshi:2.11.0")
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")

    // --- Navigation para Compose ---
    implementation("androidx.navigation:navigation-compose:2.7.7") // <- AÑADIDO

    implementation("androidx.navigation:navigation-compose:2.8.0")

    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")
}


