package com.example.fastplanner

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.example.fastplanner.ui.screens.BottomItem
import com.example.fastplanner.ui.screens.CalendarioScreen
import com.example.fastplanner.ui.screens.MainScreen
import com.example.fastplanner.ui.screens.PerfilScreen
import com.example.fastplanner.ui.theme.FastPlannerTheme
import com.example.fastplanner.data.network.RetrofitProvider
import com.example.fastplanner.data.projects.ProjectsRepository
import android.util.Log
import androidx.compose.runtime.remember
import com.example.fastplanner.ui.screens.ProjectsScreen

private object Routes {
    const val HOME = "home"
    const val PROFILE = "profile"
    const val CALENDAR = "calendar"

    const val PROJECTS = "projects"

}

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {

            FastPlannerTheme {
                val nav = rememberNavController()
                val projectsApi = remember {
                    RetrofitProvider.createProjectsApi(
                        baseUrl = "http://10.0.2.2:3000/api/",
                        tokenProvider = { null }
                    )
                }
                val projectsRepo = remember { ProjectsRepository(projectsApi) }

                NavHost(
                    navController = nav,
                    startDestination = Routes.HOME
                ) {
                    // HOME (Tableros)
                    composable(Routes.HOME) {
                        MainScreen(
                            projectsRepo = projectsRepo,
                            onProjectChanged = { projectId ->
                                Log.d("Main", "Proyecto seleccionado: $projectId")

                            },
                            onBottomNavSelected = { item ->
                                when (item) {
                                    BottomItem.Home -> Unit
                                    BottomItem.Projects -> {
                                        nav.navigate(Routes.PROJECTS) {
                                            popUpTo(Routes.HOME) { saveState = true }
                                            launchSingleTop = true
                                            restoreState = true
                                        }
                                    }
                                    BottomItem.Tasks -> {

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
                                    BottomItem.Projects -> {
                                        // TODO: nav.navigate(Routes.PROJECTS) { ... }
                                    }
                                    BottomItem.Tasks -> {
                                        // TODO: nav.navigate(Routes.TASKS) { ... }
                                    }
                                    BottomItem.Calendar -> Unit
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
                    // PROJECTS

                    composable(Routes.PROJECTS) {
                        ProjectsScreen(
                            projectsRepo = projectsRepo,
                            onAddProject = { /* ... */ },
                            onProjectClick = { p -> /* nav a detalle */ },
                            onBottomNavSelected = { item ->
                                when (item) {
                                    BottomItem.Home -> {
                                        nav.navigate(Routes.HOME) {
                                            popUpTo(Routes.HOME) { saveState = true }
                                            launchSingleTop = true
                                            restoreState = true
                                        }
                                    }
                                    BottomItem.Projects -> Unit
                                    BottomItem.Tasks -> {
                                        // TODO: nav.navigate(Routes.TASKS) { ... }
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
                                    BottomItem.Projects -> {
                                        // TODO: nav.navigate(Routes.PROJECTS) { ... }
                                    }
                                    BottomItem.Tasks -> {
                                        // TODO: nav.navigate(Routes.TASKS) { ... }
                                    }
                                    BottomItem.Calendar -> {
                                        nav.navigate(Routes.CALENDAR) {
                                            popUpTo(Routes.HOME) { saveState = true }
                                            launchSingleTop = true
                                            restoreState = true
                                        }
                                    }
                                    BottomItem.Profile -> Unit
                                }
                            },
                            onBack = { nav.popBackStack() }
                        )
                    }
                }
            }
        }
    }
}




