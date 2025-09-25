#!/usr/bin/env python3
"""
Burndown charts (corregido)
- Detecta correctamente los usuarios (toma 'Item' y si falta usa 'Group name').
- Evita doble conteo: si existe una fila con 'Item' para un usuario, se ignora la fila solo con 'Group name'.
- Detecta y ordena las columnas de fecha aunque usen abreviaturas en español ("ago", "sept").
- Convierte tiempos como "5h 10m", "30m", "7h" a minutos.
- Calcula burndown por usuario y del equipo para el sprint 27-ago-2025 -> 24-sept-2025.
- Esperado: 5 h/semana por persona -> 4 semanas -> 20 h por persona.
- Genera gráficos en horas y guarda PNG por cada usuario y uno del equipo.

Coloca el CSV en la misma carpeta que este script o modifica `file_path`.
Requisitos: pandas, matplotlib, numpy
Instalar (si hace falta): pip install pandas matplotlib numpy

Ejecutar:
    python Burndowns.py

"""

import re
import os
import datetime as dt
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

# ------------------- CONFIG -------------------
# Ruta al CSV: cambia aquí si ejecutas en Windows (por ejemplo: r"C:\...\Tiempo trabajado - sprint 1.csv")
file_path = "tiempo_trabajado_sprint1.csv"
# Nombre de archivo de salida (carpeta actual)
out_dir = "."
# Sprint (no es necesario cambiarlos; solo informativos)
start_date = dt.date(2025, 8, 27)
end_date   = dt.date(2025, 9, 24)
# Horas esperadas por semana y número de semanas (aquí 4 semanas)
horas_por_semana = 5
num_semanas = 4
horas_esperadas_por_persona = horas_por_semana * num_semanas
# ----------------------------------------------

# Helper: parse spanish month abbreviations -> month number
SPANISH_MONTHS = {
    "ene":1, "enero":1,
    "feb":2, "febrero":2,
    "mar":3, "marzo":3,
    "abr":4, "abril":4,
    "may":5, "mayo":5,
    "jun":6, "junio":6,
    "jul":7, "julio":7,
    "ago":8, "agosto":8,
    "sep":9, "sept":9, "septiembre":9,
    "oct":10, "octubre":10,
    "nov":11, "noviembre":11,
    "dic":12, "diciembre":12
}


def parse_spanish_date_label(label):
    """Toma un header tipo '27 ago 2025 00:00' o '1 sept 2025 00:00' y devuelve date."""
    s = str(label).strip()
    # quitar la parte de la hora si existe
    s = re.sub(r"\s+00:00$", "", s)
    parts = s.split()
    if len(parts) < 3:
        raise ValueError(f"Formato de fecha inesperado: '{label}'")
    day = int(parts[0])
    month_str = parts[1].lower()
    # normalizar a 3-4 letras, buscar en el diccionario
    month_key = month_str[:4] if month_str[:4] in SPANISH_MONTHS else month_str[:3]
    if month_key not in SPANISH_MONTHS:
        # intentar limpiar caracteres no alfabéticos
        month_key = re.sub(r"[^a-z]","", month_str)[:4]
    month = SPANISH_MONTHS.get(month_key)
    if not month:
        raise ValueError(f"Mes no reconocido en: '{label}' (usado: '{month_key}')")
    year = int(parts[2])
    return dt.date(year, month, day)


def to_minutes(value):
    """Convierte '5h 10m' / '30m' / '7h' / '' / nan a minutos (int)."""
    if pd.isna(value):
        return 0
    s = str(value).strip()
    if s == "":
        return 0
    h = 0
    m = 0
    mh = re.search(r"(\d+)\s*h", s)
    mm = re.search(r"(\d+)\s*m", s)
    if mh:
        h = int(mh.group(1))
    if mm:
        m = int(mm.group(1))
    return h*60 + m


# ----------------- Leer CSV -----------------
if not os.path.exists(file_path):
    raise FileNotFoundError(f"Archivo no encontrado: {file_path}. Pon el CSV en la misma carpeta o ajusta file_path.")

print("Leyendo:", file_path)
df = pd.read_csv(file_path)

# Detectar columnas de fecha (comienzan con el día, p.ej. '27 ago 2025 00:00')
fecha_cols = [c for c in df.columns if re.match(r"^\d{1,2}\s+", str(c))]
if not fecha_cols:
    raise ValueError("No se encontraron columnas de fecha en el CSV (buscar cabeceras como '27 ago 2025 00:00').")

# Parsear y ordenar las columnas de fecha por fecha real
parsed = []
for c in fecha_cols:
    try:
        d = parse_spanish_date_label(c)
        parsed.append((c, d))
    except Exception as e:
        raise ValueError(f"Error parseando columna de fecha '{c}': {e}")

# ordenar por la fecha real
parsed_sorted = sorted(parsed, key=lambda x: x[1])
fecha_cols_sorted = [t[0] for t in parsed_sorted]
dates = [t[1] for t in parsed_sorted]

# ----------------- Usuarios (evitar doble conteo) -----------------
# construir columna 'user' usando Item si existe, si no Group name
if 'Item' not in df.columns or 'Group name' not in df.columns:
    raise ValueError("CSV debe contener columnas 'Item' y 'Group name'.")

df['user'] = df['Item'].fillna(df['Group name'])
df['row_has_item'] = df['Item'].notna()
users_with_item = df.loc[df['row_has_item'], 'user'].unique()
# conservar solo filas con 'Item' cuando existan para ese usuario, sino conservar la fila disponible
df_clean = df[(df['user'].isin(users_with_item) & df['row_has_item']) | (~df['user'].isin(users_with_item))].copy()

# ----------------- Convertir tiempos a minutos -----------------
for col in fecha_cols_sorted:
    df_clean[col] = df_clean[col].apply(to_minutes)

# Agrupar por usuario (sumar filas si un usuario tuviera más de una fila)
daily_by_user = df_clean.groupby('user')[fecha_cols_sorted].sum()

# Número de usuarios (considerados en el equipo)
usuarios = list(daily_by_user.index)
num_usuarios = len(usuarios)
print(f"Usuarios detectados: {num_usuarios}", usuarios)

# ----------------- Calcular burndown -----------------
# Cumulative worked minutes por usuario
cum_minutes_by_user = daily_by_user.cumsum(axis=1)

# convertir a horas acumuladas
cum_hours_by_user = cum_minutes_by_user / 60.0

# expected por persona y por equipo
expected_hours_person = horas_esperadas_por_persona
expected_hours_team = expected_hours_person * num_usuarios

# crear carpeta de salida si no existe
os.makedirs(out_dir, exist_ok=True)

# Función de trazado (horas)
def plot_and_save(dates, real_hours, ideal_hours, title, fname):
    plt.figure(figsize=(10,6))
    plt.plot(dates, real_hours, marker='o', label='Real')
    plt.plot(dates, ideal_hours, '--', label='Ideal')
    plt.title(title)
    plt.xlabel('Fecha')
    plt.ylabel('Horas pendientes')
    plt.xticks(rotation=45)
    plt.grid(axis='y', linestyle='--', alpha=0.4)
    plt.legend()
    plt.tight_layout()
    path = os.path.join(out_dir, fname)
    plt.savefig(path, dpi=150)
    print(f"Guardado: {path}")
    plt.show()

# Graficar por usuario
for user in usuarios:
    cum_hours = cum_hours_by_user.loc[user].values  # horas acumuladas
    remaining = expected_hours_person - cum_hours
    ideal = np.linspace(expected_hours_person, 0, len(dates))
    title = f"Burndown - {user}  (esperado {expected_hours_person} h)"
    fname = f"burndown_{user}.png"
    plot_and_save(dates, remaining, ideal, title, fname)

# Graficar equipo
team_daily_minutes = daily_by_user.sum(axis=0)
team_cum_hours = team_daily_minutes.cumsum() / 60.0
team_remaining = expected_hours_team - team_cum_hours
ideal_team = np.linspace(expected_hours_team, 0, len(dates))
plot_and_save(dates, team_remaining, ideal_team, f"Burndown - Equipo (esperado {expected_hours_team} h)", "burndown_equipo.png")

print('Terminado.')
