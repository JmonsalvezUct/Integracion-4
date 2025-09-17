import pandas as pd
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet

# Leer CSV original
df = pd.read_csv("incidencias (4).csv")

# 🔄 Reemplazar valores en todo el DataFrame
df = df.replace({
    "admin": "sarancibia2022",
    "Leo": "lplaceres2022"
})

df = df.rename(columns={"Tiempo empleado": "Tiempo empleado (min)"})
df = df.rename(columns={"Estimación": "Estimación (min)"})

# Columnas para cada tabla
cols_principal = [
    "ID de la incidencia",
    "Usuario asignado",
    "Estado",
    "Prioridad",
    "Estimación (min)"
]
cols_resumen = [
    "ID de la incidencia",
    "Resumen"
]

# Crear documento PDF
pdf_filename = "incidencias.pdf"
doc = SimpleDocTemplate(pdf_filename, pagesize=letter)
styles = getSampleStyleSheet()
elements = []

# Título
elements.append(Paragraph("Tareas asignadas - Semana 4", styles["Title"]))
elements.append(Spacer(1, 20))

# ==============================
# TABLA PRINCIPAL
# ==============================
data_principal = [cols_principal] + df[cols_principal].values.tolist()

# Ajuste de ancho (10% más angosta que la página)
page_width = letter[0] - doc.leftMargin 
table_width = page_width * 0.95
col_widths = [table_width / len(cols_principal)] * len(cols_principal)

table_principal = Table(data_principal, colWidths=col_widths, repeatRows=1)

table_principal.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#4a90e2")),
    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
    ("FONTSIZE", (0, 0), (-1, -1), 9),
    ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
    ("BACKGROUND", (0, 1), (-1, -1), colors.whitesmoke),
    ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
]))
elements.append(Paragraph("Tabla Principal", styles["Heading2"]))
elements.append(table_principal)
elements.append(Spacer(1, 30))

# ==============================
# TABLA DE RESUMEN
# ==============================
data_resumen = [cols_resumen] + df[cols_resumen].values.tolist()

table_resumen = Table(data_resumen, repeatRows=1)

table_resumen.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#50b848")),  # verde
    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
    ("ALIGN", (0, 0), (-1, -1), "LEFT"),
    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
    ("FONTSIZE", (0, 0), (-1, -1), 9),
    ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
    ("BACKGROUND", (0, 1), (-1, -1), colors.whitesmoke),
    ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
]))
elements.append(Paragraph("Descripción de tareas", styles["Heading2"]))
elements.append(table_resumen)

# Construir PDF
doc.build(elements)

print(f"✅ PDF generado: {pdf_filename}")
