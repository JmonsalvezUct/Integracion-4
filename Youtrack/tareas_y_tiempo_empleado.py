import pandas as pd
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet

# ============================
# 🔹 Leer CSVs
# ============================
df_incidencias = pd.read_csv("Incidencias_sprint2_semana3.csv")
df_horas = pd.read_csv("Parte de horas sprint 2 - semana 3.csv")

# 🔄 Normalizar nombres de usuarios
df_incidencias = df_incidencias.replace({
    "admin": "sarancibia2022",
    "Leo": "lplaceres2022"
})

# Renombrar columnas largas
df_incidencias = df_incidencias.rename(columns={
    "Tiempo empleado": "T. empleado",
    "Estimación": "Estim. (min)"
})

# ============================
# 🔹 Unir incidencias con parte de horas
# ============================
cols_tiempo = [c for c in df_horas.columns if "00:00" in c]

# Reducir nombres de fechas
rename_map = {c: c.split(" ")[0] + "-" + c.split(" ")[1] for c in cols_tiempo}
df_horas = df_horas.rename(columns=rename_map)
df_horas_simple = df_horas[["Item"] + list(rename_map.values())]

df_merge = df_incidencias.merge(
    df_horas_simple,
    left_on="ID de la incidencia",
    right_on="Item",
    how="left"
).drop(columns=["Item"])

# ============================
# 🔹 Columnas finales para PDF
# ============================
# Cambiar nombres para mostrar en PDF
pdf_column_names = [
    "ID de la incidencia",  # → id
    "Usuario asignado",     # → encargado
    "Estado",
    "Prioridad",
    "Resuelta",
] + list(rename_map.values())

# Mapeo de nombres cortos
pdf_column_map = {
    "ID de la incidencia": "ID",
    "Usuario asignado": "Encargado"
}

cols_resumen = ["ID de la incidencia", "Resumen"]

# ============================
# 🔹 PDF
# ============================
pdf_filename = "incidencias.pdf"
doc = SimpleDocTemplate(pdf_filename, pagesize=letter)
styles = getSampleStyleSheet()
elements = []

elements.append(Paragraph("Detalle actualizado de tareas asignadas - Semana 3", styles["Title"]))
elements.append(Spacer(1, 20))

# ============================
# TABLA PRINCIPAL
# ============================
# Preparar datos y reemplazar nombres de columnas para mostrar
data_principal = [ [pdf_column_map.get(c, c) for c in pdf_column_names] ] \
                 + df_merge[pdf_column_names].fillna("").values.tolist()

page_width = letter[0] - doc.leftMargin
table_width = page_width

# Anchos relativos → más espacio a Estado y Resuelta
col_widths = []
for col in pdf_column_names:
    if col == "Estado":
        col_widths.append(table_width * 0.07)
    elif col == "Resuelta":
        col_widths.append(table_width * 0.15)
    elif col == "Usuario asignado":
        col_widths.append(table_width * 0.15)
    else:
        col_widths.append(table_width * 0.63 / (len(pdf_column_names) - 2))

table_principal = Table(data_principal, colWidths=col_widths, repeatRows=1)
table_principal.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#4a90e2")),
    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
    ("FONTSIZE", (0, 0), (-1, -1), 8),
    ("BOTTOMPADDING", (0, 0), (-1, 0), 6),
    ("BACKGROUND", (0, 1), (-1, -1), colors.whitesmoke),
    ("GRID", (0, 0), (-1, -1), 0.25, colors.grey),
]))
elements.append(Paragraph("Tabla Principal", styles["Heading2"]))
elements.append(table_principal)
elements.append(Spacer(1, 25))

# ============================
# TABLA DE RESUMEN
# ============================
data_resumen = [ ["ID", "Resumen"] ] + df_merge[cols_resumen].values.tolist()

table_resumen = Table(data_resumen, colWidths=[page_width* 0.1, page_width * 0.9], repeatRows=1)
table_resumen.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#50b848")),
    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
    ("ALIGN", (0, 0), (-1, -1), "LEFT"),
    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
    ("FONTSIZE", (0, 0), (-1, -1), 9),
    ("BOTTOMPADDING", (0, 0), (-1, 0), 6),
    ("BACKGROUND", (0, 1), (-1, -1), colors.whitesmoke),
    ("GRID", (0, 0), (-1, -1), 0.25, colors.grey),
]))
elements.append(Paragraph("Descripción de tareas", styles["Heading2"]))
elements.append(table_resumen)

doc.build(elements)

print(f"✅ PDF generado: {pdf_filename}")
