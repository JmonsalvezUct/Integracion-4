package com.example.fastplanner

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.getValue
import androidx.compose.ui.platform.LocalContext
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.example.fastplanner.ui.screens.BottomItem
import com.example.fastplanner.ui.screens.CalendarioScreen
import com.example.fastplanner.ui.screens.MainScreen
import com.example.fastplanner.ui.screens.PerfilScreen
import com.example.fastplanner.ui.settings.SettingsViewModel
import com.example.fastplanner.ui.theme.FastPlannerTheme   // <-- usa tu tema

private object Routes {
    const val HOME = "home"
    const val PROFILE = "profile"
    const val CALENDAR = "calendar"
    // Futuro: const val PROJECTS = "projects"; const val TASKS = "tasks"
}

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            // ViewModel que lee/guarda el modo desde DataStore
            val appCtx = LocalContext.current.applicationContext
            val settingsVm: SettingsViewModel = viewModel(
                factory = SettingsViewModel.provideFactory(appCtx)
            )
            val isDark by settingsVm.isDarkMode.collectAsStateWithLifecycle()

            // 👉 Usa tu tema y pasa el booleano
            FastPlannerTheme(darkTheme = isDark) {
                val nav = rememberNavController()

                NavHost(
                    navController = nav,
                    startDestination = Routes.HOME
                ) {
                    // HOME (Tableros)
                    composable(Routes.HOME) {
                        MainScreen(
                            onBottomNavSelected = { item ->
                                when (item) {
                                    BottomItem.Home -> Unit // ya estás en Home
                                    BottomItem.Projects -> {
                                        // TODO: nav.navigate(Routes.PROJECTS)
                                    }
                                    BottomItem.Tasks -> {
                                        // TODO: nav.navigate(Routes.TASKS)
                                    }
                                    BottomItem.Calendar -> {
                                        nav.navigate(Routes.CALENDAR) {
                                            popUpTo(Routes.HOME) { saveState = true }
                                            launchSingleTop = true
                                            restoreState = true
                                        }
                                    }
                                    BottomItem.Profile -> {
                                        nav.navigate(Routes.PROFILE) {
                                            popUpTo(Routes.HOME) { saveState = true }
                                            launchSingleTop = true
                                            restoreState = true
                                        }
                                    }
                                }
                            }
                        )
                    }

                    // CALENDARIO
                    composable(Routes.CALENDAR) {
                        CalendarioScreen(
                            onBottomNavSelected = { item ->
                                when (item) {
                                    BottomItem.Home -> {
                                        nav.navigate(Routes.HOME) {
                                            popUpTo(Routes.HOME) { saveState = true }
                                            launchSingleTop = true
                                            restoreState = true
                                        }
                                    }
                                    BottomItem.Projects -> { /* TODO */ }
                                    BottomItem.Tasks -> { /* TODO */ }
                                    BottomItem.Calendar -> Unit // ya estás en Calendario
                                    BottomItem.Profile -> {
                                        nav.navigate(Routes.PROFILE) {
                                            popUpTo(Routes.HOME) { saveState = true }
                                            launchSingleTop = true
                                            restoreState = true
                                        }
                                    }
                                }
                            },
                            onBack = { nav.popBackStack() }
                        )
                    }

                    // PERFIL
                    composable(Routes.PROFILE) {
                        PerfilScreen(
                            onBottomNavSelected = { item ->
                                when (item) {
                                    BottomItem.Home -> {
                                        nav.navigate(Routes.HOME) {
                                            popUpTo(Routes.HOME) { saveState = true }
                                            launchSingleTop = true
                                            restoreState = true
                                        }
                                    }
                                    BottomItem.Projects -> { /* TODO */ }
                                    BottomItem.Tasks -> { /* TODO */ }
                                    BottomItem.Calendar -> {
                                        nav.navigate(Routes.CALENDAR) {
                                            popUpTo(Routes.HOME) { saveState = true }
                                            launchSingleTop = true
                                            restoreState = true
                                        }
                                    }
                                    BottomItem.Profile -> Unit // ya estás en Perfil
                                }
                            },
                            onBack = { nav.popBackStack() },
                            // pasa el VM para que el switch funcione
                            settingsVm = settingsVm
                        )
                    }
                }
            }
        }
    }
}





