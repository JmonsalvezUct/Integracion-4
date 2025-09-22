package com.example.fastplanner.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.Orientation
import androidx.compose.foundation.gestures.draggable
import androidx.compose.foundation.gestures.rememberDraggableState
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.ListAlt
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.Folder
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.onGloballyPositioned
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.example.fastplanner.ui.theme.ContentBgColor
import com.example.fastplanner.ui.theme.HeaderColor
import com.example.fastplanner.ui.theme.TextPrimary
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.net.HttpURLConnection
import java.net.URL
import org.json.JSONArray
import java.io.BufferedReader
import java.io.InputStreamReader
import java.time.DayOfWeek
import java.time.LocalDate
import java.time.YearMonth
import java.time.format.TextStyle
import java.util.Locale
import kotlin.math.roundToInt

// Emulador Android: el backend del PC se ve como 10.0.2.2
private const val BASE_URL = "http://10.0.2.2:3000"

private enum class CalMode { MONTH, WEEK }

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CalendarioScreen(
    onBottomNavSelected: (BottomItem) -> Unit,
    onBack: () -> Unit = {}
) {
    // ----- Estado -----
    var visibleMonth by remember { mutableStateOf(YearMonth.now()) }
    var selectedDate by remember { mutableStateOf(LocalDate.now()) }
    var mode by remember { mutableStateOf(CalMode.MONTH) }

    // fecha -> lista de nombres (desde API)
    var itemsByDate by remember(visibleMonth) { mutableStateOf<Map<LocalDate, List<String>>>(emptyMap()) }
    var loading by remember(visibleMonth) { mutableStateOf(false) }
    var error by remember(visibleMonth) { mutableStateOf<String?>(null) }

    val itemsForSelected = itemsByDate[selectedDate].orEmpty()

    // rango de la grilla mensual (lunes..domingo)
    val firstOfMonth = visibleMonth.atDay(1)
    val firstCell = firstOfMonth.minusDays(((firstOfMonth.dayOfWeek.value + 6) % 7).toLong())
    val lastOfMonth = visibleMonth.atEndOfMonth()
    val lastCell = lastOfMonth.plusDays((7 - lastOfMonth.dayOfWeek.value) % 7L)

    // si estás en semanal y cambias de semana a otro mes, sincroniza
    LaunchedEffect(mode, selectedDate) {
        if (mode == CalMode.WEEK && YearMonth.from(selectedDate) != visibleMonth) {
            visibleMonth = YearMonth.from(selectedDate)
        }
    }

    // cargar /api/projects cuando cambia el mes visible
    LaunchedEffect(visibleMonth) {
        loading = true; error = null
        runCatching { withContext(Dispatchers.IO) { fetchProjects() } }
            .onSuccess { list ->
                val grouped = list
                    .filter { it.createdAt != null && it.name != null && it.createdAt!!.length >= 10 }
                    .map { it.copy(dateOnly = it.createdAt!!.take(10)) } // "YYYY-MM-DD"
                    .filter {
                        val d = LocalDate.parse(it.dateOnly!!)
                        !d.isBefore(firstCell) && !d.isAfter(lastCell)
                    }
                    .groupBy(
                        keySelector = { LocalDate.parse(it.dateOnly!!) },
                        valueTransform = { it.name!! }
                    )
                itemsByDate = grouped
            }
            .onFailure { e ->
                error = e.message ?: "Error al cargar"
                itemsByDate = emptyMap()
            }
        loading = false
    }

    // ----- UI -----
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Calendario", color = Color.White) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Atrás", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = HeaderColor,
                    titleContentColor = Color.White
                )
            )
        },
        bottomBar = {
            CalendarioBottomBar(
                selected = BottomItem.Calendar,
                onSelected = onBottomNavSelected
            )
        },
        containerColor = HeaderColor
    ) { inner ->
        Column(
            modifier = Modifier
                .padding(inner)
                .fillMaxSize()
                .background(HeaderColor)
        ) {
            Surface(
                modifier = Modifier.fillMaxSize(),
                shape = RoundedCornerShape(topStart = 28.dp, topEnd = 28.dp),
                color = Color.White
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(ContentBgColor)
                        .padding(16.dp)
                ) {
                    // Cabecera, navegación y toggle
                    HeaderWithNav(
                        month = visibleMonth,
                        mode = mode,
                        onPrev = {
                            if (mode == CalMode.MONTH) visibleMonth = visibleMonth.minusMonths(1)
                            else selectedDate = selectedDate.minusWeeks(1)
                        },
                        onNext = {
                            if (mode == CalMode.MONTH) visibleMonth = visibleMonth.plusMonths(1)
                            else selectedDate = selectedDate.plusWeeks(1)
                        },
                        onModeChange = { mode = it }
                    )

                    Spacer(Modifier.height(8.dp))
                    WeekHeaders()
                    Spacer(Modifier.height(6.dp))

                    // Semana: necesitamos el ancho para calcular el tamaño de cada celda y así mover por días
                    var weekRowWidthPx by remember { mutableStateOf(0f) }
                    val spacingPx = with(LocalDensity.current) { 6.dp.toPx() } // mismo espaciado que WeekRow
                    val cellWidthPx =
                        if (mode == CalMode.WEEK && weekRowWidthPx > 0f) (weekRowWidthPx - spacingPx * 6) / 7f else 0f

                    // Calendario
                    if (mode == CalMode.MONTH) {
                        MonthGrid(
                            month = visibleMonth,
                            selected = selectedDate,
                            tasksCountByDate = itemsByDate.mapValues { it.value.size },
                            onSelect = { selectedDate = it }
                        )
                    } else {
                        val weekStart = selectedDate.minusDays(((selectedDate.dayOfWeek.value + 6) % 7).toLong())
                        WeekRow(
                            weekStart = weekStart,
                            selected = selectedDate,
                            tasksCountByDate = itemsByDate.mapValues { it.value.size },
                            onSelect = { selectedDate = it },
                            onMeasuredWidth = { weekRowWidthPx = it }
                        )
                    }

                    Spacer(Modifier.height(12.dp))

                    Text(
                        "Tareas para $selectedDate",
                        style = MaterialTheme.typography.titleMedium,
                        color = TextPrimary
                    )
                    if (mode == CalMode.WEEK) {
                        Spacer(Modifier.height(4.dp))
                        AssistChip(onClick = {}, enabled = false,
                            label = { Text("Arrastra izq/der para mover a otro día (vista Semanal)") })
                    }
                    Spacer(Modifier.height(6.dp))

                    if (loading) LinearProgressIndicator(Modifier.fillMaxWidth())
                    error?.let { Text("Error: $it", color = MaterialTheme.colorScheme.error) }

                    if (!loading && itemsForSelected.isEmpty()) {
                        EmptyCard("Sin elementos para este día")
                    } else {
                        // --- TDI-76: mover por drag horizontal en vista Semanal ---
                        TaskListDraggable(
                            items = itemsForSelected,
                            enabled = (mode == CalMode.WEEK && cellWidthPx > 0f),
                            cellWidthPx = cellWidthPx
                        ) { name, daysDelta ->
                            if (daysDelta != 0) {
                                val newDate = selectedDate.plusDays(daysDelta.toLong())
                                val mutable = itemsByDate.mapValues { it.value.toMutableList() }.toMutableMap()
                                mutable[selectedDate]?.remove(name)
                                mutable.getOrPut(newDate) { mutableListOf() }.add(name)
                                itemsByDate = mutable
                                selectedDate = newDate // opcional: saltar al nuevo día
                            }
                        }
                    }
                }
            }
        }
    }
}

// ---------- Header + toggle ----------
@Composable
private fun HeaderWithNav(
    month: YearMonth,
    mode: CalMode,
    onPrev: () -> Unit,
    onNext: () -> Unit,
    onModeChange: (CalMode) -> Unit
) {
    Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth()) {
        val monthName = month.month.getDisplayName(TextStyle.FULL, Locale.getDefault())
            .replaceFirstChar { if (it.isLowerCase()) it.titlecase(Locale.getDefault()) else it.toString() }
        Text(
            text = "$monthName ${month.year}",
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.SemiBold,
            modifier = Modifier.weight(1f)
        )
        FilledTonalButton(onClick = onPrev) { Text("◀") }
        Spacer(Modifier.width(6.dp))
        FilledTonalButton(onClick = onNext) { Text("▶") }
    }
    Spacer(Modifier.height(8.dp))
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        FilterChip(selected = mode == CalMode.MONTH, onClick = { onModeChange(CalMode.MONTH) }, label = { Text("Mes") })
        FilterChip(selected = mode == CalMode.WEEK, onClick = { onModeChange(CalMode.WEEK) }, label = { Text("Semana") })
    }
}

// ---------- Cabeceras ----------
@Composable
private fun WeekHeaders() {
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
        DayOfWeek.values().forEach { dow ->
            Text(
                dow.getDisplayName(TextStyle.SHORT, Locale.getDefault()),
                modifier = Modifier.weight(1f),
                textAlign = TextAlign.Center,
                style = MaterialTheme.typography.labelMedium
            )
        }
    }
}

// ---------- Vista mensual ----------
@Composable
private fun MonthGrid(
    month: YearMonth,
    selected: LocalDate,
    tasksCountByDate: Map<LocalDate, Int>,
    onSelect: (LocalDate) -> Unit
) {
    val firstOfMonth = month.atDay(1)
    val firstCell = firstOfMonth.minusDays(((firstOfMonth.dayOfWeek.value + 6) % 7).toLong())
    val lastOfMonth = month.atEndOfMonth()
    val lastCell = lastOfMonth.plusDays((7 - lastOfMonth.dayOfWeek.value) % 7L)
    val days = generateSequence(firstCell) { it.plusDays(1) }
        .takeWhile { !it.isAfter(lastCell) }
        .toList()

    LazyVerticalGrid(
        columns = GridCells.Fixed(7),
        verticalArrangement = Arrangement.spacedBy(6.dp),
        horizontalArrangement = Arrangement.spacedBy(6.dp),
        modifier = Modifier.heightIn(min = 260.dp)
    ) {
        items(days) { day ->
            val inMonth = day.month == month.month
            DayCell(
                date = day,
                isSelected = day == selected,
                count = tasksCountByDate[day] ?: 0,
                enabled = inMonth,
                onClick = { onSelect(day) }
                // square=true por defecto (cuadrado)
            )
        }
    }
}

// ---------- Vista semanal (arreglada) ----------
@Composable
private fun WeekRow(
    weekStart: LocalDate,
    selected: LocalDate,
    tasksCountByDate: Map<LocalDate, Int>,
    onSelect: (LocalDate) -> Unit,
    onMeasuredWidth: (Float) -> Unit
) {
    Row(
        Modifier
            .fillMaxWidth()
            .onGloballyPositioned { onMeasuredWidth(it.size.width.toFloat()) },
        horizontalArrangement = Arrangement.spacedBy(6.dp)
    ) {
        repeat(7) { idx ->
            val day = weekStart.plusDays(idx.toLong())
            DayCell(
                date = day,
                isSelected = day == selected,
                count = tasksCountByDate[day] ?: 0,
                enabled = true,
                onClick = { onSelect(day) },
                square = false,                 // Semana: rectangular
                modifier = Modifier.weight(1f)  // 7 columnas iguales
            )
        }
    }
}

// ---------- Celda reutilizable ----------
@Composable
private fun DayCell(
    date: LocalDate,
    isSelected: Boolean,
    count: Int,
    enabled: Boolean,
    onClick: () -> Unit,
    square: Boolean = true,

    modifier: Modifier = Modifier
) {
    val bg = if (isSelected) MaterialTheme.colorScheme.primary.copy(alpha = 0.12f) else Color.White
    val border = if (isSelected) MaterialTheme.colorScheme.primary else Color(0xFFE6E6E6)

    val sizeMod = if (square) {
        modifier.aspectRatio(1f)            // Mes: cuadrado
    } else {
        modifier.height(64.dp)              // Semana: altura fija
    }

    Surface(
        shape = RoundedCornerShape(10.dp),
        color = bg,
        modifier = sizeMod
            .border(1.dp, border, RoundedCornerShape(10.dp))
            .clickable(enabled = enabled, onClick = onClick)
            .padding(6.dp)
    ) {
        Column(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.SpaceBetween,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = date.dayOfMonth.toString(),
                style = MaterialTheme.typography.bodyMedium,
                color = if (enabled) TextPrimary else Color.Gray
            )
            if (count > 0) {
                AssistChip(onClick = onClick, label = { Text("$count") }, shape = RoundedCornerShape(50))
            } else {
                Spacer(Modifier.height(20.dp))
            }
        }
    }
}

// ---------- Lista con drag (TDI-76) ----------
@Composable
private fun TaskListDraggable(
    items: List<String>,
    enabled: Boolean,
    cellWidthPx: Float,
    onMoveByDays: (name: String, daysDelta: Int) -> Unit
) {
    Surface(shape = RoundedCornerShape(12.dp), color = Color.White, modifier = Modifier.fillMaxWidth()) {
        LazyColumn(
            modifier = Modifier.fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(8.dp),
            contentPadding = PaddingValues(12.dp)
        ) {
            items(items.size) { i ->
                val name = items[i]
                var dragPx by remember { mutableStateOf(0f) }

                // texto auxiliar mientras arrastras (p.ej. "→ +2d")
                val deltaDays =
                    if (enabled && cellWidthPx > 0f) (dragPx / cellWidthPx).roundToInt().coerceIn(-6, 6) else 0
                val suffix = if (enabled && deltaDays != 0) "  (→ ${if (deltaDays>0) "+" else ""}$deltaDays d)" else ""

                Text(
                    "• $name$suffix",
                    color = TextPrimary,
                    modifier = Modifier
                        .fillMaxWidth()
                        .then(
                            if (enabled)
                                Modifier.draggable(
                                    orientation = Orientation.Horizontal,
                                    state = rememberDraggableState { delta -> dragPx += delta },
                                    onDragStopped = {
                                        val steps = (dragPx / cellWidthPx).roundToInt().coerceIn(-6, 6)
                                        if (steps != 0) onMoveByDays(name, steps)
                                        dragPx = 0f
                                    }
                                )
                            else Modifier
                        )
                )
                if (i < items.lastIndex) Divider()
            }
        }
    }
}

@Composable
private fun EmptyCard(text: String) {
    Surface(shape = RoundedCornerShape(12.dp), color = Color.White, modifier = Modifier.fillMaxWidth()) {
        Box(Modifier.padding(16.dp)) { Text(text, color = TextPrimary) }
    }
}

// ---------- HTTP sencillo + parser JSON ----------
private data class ProjectApi(
    val id: Int?,
    val name: String?,
    val createdAt: String?,
    val dateOnly: String? = null
)

private suspend fun fetchProjects(): List<ProjectApi> = withContext(Dispatchers.IO) {
    val url = URL("$BASE_URL/api/projects")
    val conn = (url.openConnection() as HttpURLConnection).apply {
        requestMethod = "GET"
        connectTimeout = 8000
        readTimeout = 8000
    }
    conn.inputStream.use { input ->
        val text = BufferedReader(InputStreamReader(input)).readText()
        val arr = JSONArray(text)
        buildList {
            for (i in 0 until arr.length()) {
                val o = arr.getJSONObject(i)
                add(
                    ProjectApi(
                        id = if (o.has("id")) o.optInt("id") else null,
                        name = if (o.has("name")) o.optString("name") else null,
                        createdAt = if (o.has("createdAt")) o.optString("createdAt") else null
                    )
                )
            }
        }
    }
}

// ---------- Bottom bar como la tuya ----------
@Composable
private fun CalendarioBottomBar(
    selected: BottomItem,
    onSelected: (BottomItem) -> Unit
) {
    NavigationBar {
        NavItem(Icons.Filled.Home, "Inicio", selected == BottomItem.Home) { onSelected(BottomItem.Home) }
        NavItem(Icons.Filled.Folder, "Proyectos", selected == BottomItem.Projects) { onSelected(BottomItem.Projects) }
        NavItem(Icons.AutoMirrored.Filled.ListAlt, "Tareas", selected == BottomItem.Tasks) { onSelected(BottomItem.Tasks) }
        NavItem(Icons.Filled.CalendarMonth, "Calendario", selected == BottomItem.Calendar) { onSelected(BottomItem.Calendar) }
        NavItem(Icons.Filled.Person, "Perfil", selected == BottomItem.Profile) { onSelected(BottomItem.Profile) }
    }
}

@Composable
private fun RowScope.NavItem(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    label: String,
    selected: Boolean,
    onClick: () -> Unit
) {
    NavigationBarItem(
        selected = selected,
        onClick = onClick,
        icon = { Icon(icon, contentDescription = label) },
        label = { Text(label) }
    )
}
