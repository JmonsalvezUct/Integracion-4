import pandas as pd 
from reportlab.lib.pagesizes import letter 
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer 
from reportlab.lib import colors 
from reportlab.lib.styles import getSampleStyleSheet 

# ===============================
# 🔹 Función para convertir minutos a hh:mm
def minutes_to_hhmm(minutes):
    try:
        minutes = int(minutes)
        hours, mins = divmod(minutes, 60)
        return f"{hours:02d}:{mins:02d}"
    except:
        return minutes

# ===============================
# Leer CSV original 
df = pd.read_csv("Incidencias_sprint2_semana2.csv") 

# 🔄 Reemplazar valores en todo el DataFrame 
df = df.replace({ 
    "admin": "sarancibia2022", 
    "Leo": "lplaceres2022" 
}) 

# Renombrar columnas internas
df = df.rename(columns={
    "Tiempo empleado": "Tiempo empleado (min)", 
    "Estimación": "Estimación (min)"
})

# Convertir a formato hh:mm
df["Tiempo empleado (hh:mm)"] = df["Tiempo empleado (min)"].apply(minutes_to_hhmm)
df["Estimación (hh:mm)"] = df["Estimación (min)"].apply(minutes_to_hhmm)

# ===============================
# Columnas con nombres cortos
cols_principal = [ 
    "ID", 
    "Encargado", 
    "Estado", 
    "Prioridad", 
    "T. empleado (hh:mm)", 
    "T. Estimado (hh:mm)" 
]

# Mapeo para mostrar nombres cortos
df_display = df.rename(columns={
    "ID de la incidencia": "ID",
    "Usuario asignado": "Encargado",
    "Tiempo empleado (hh:mm)": "T. empleado (hh:mm)",
    "Estimación (hh:mm)": "T. Estimado (hh:mm)"
})

cols_resumen = [ "ID", "Resumen" ] 

# ===============================
# Crear documento PDF 
pdf_filename = "tareas_de_la_semana.pdf" 
doc = SimpleDocTemplate(pdf_filename, pagesize=letter) 
styles = getSampleStyleSheet() 
elements = [] 

# Título 
elements.append(Paragraph("Tareas asignadas - Semana 2", styles["Title"]))
elements.append(Spacer(1, 20)) 

# ===============================
# TABLA PRINCIPAL 
data_principal = [cols_principal] + df_display[cols_principal].values.tolist() 

page_width = letter[0] - doc.leftMargin 
table_width = page_width * 0.95
col_widths = [table_width / len(cols_principal)] * len(cols_principal) 

table_principal = Table(data_principal, colWidths=col_widths, repeatRows=1) 
table_principal.setStyle(TableStyle([ 
    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#4a90e2")), 
    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white), 
    ("ALIGN", (0, 0), (-1, -1), "CENTER"), 
    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"), 
    ("FONTSIZE", (0, 0), (-1, -1), 8),   # 🔹 tamaño de fuente reducido
    ("BOTTOMPADDING", (0, 0), (-1, 0), 6), 
    ("BACKGROUND", (0, 1), (-1, -1), colors.whitesmoke), 
    ("GRID", (0, 0), (-1, -1), 0.5, colors.grey), 
])) 

elements.append(Paragraph("Tabla Principal", styles["Heading2"])) 
elements.append(table_principal) 
elements.append(Spacer(1, 30)) 

# ===============================
# TABLA DE RESUMEN 
data_resumen = [cols_resumen] + df_display[cols_resumen].values.tolist() 

table_resumen = Table(data_resumen, repeatRows=1) 
table_resumen.setStyle(TableStyle([ 
    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#50b848")),
    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white), 
    ("ALIGN", (0, 0), (-1, -1), "LEFT"), 
    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"), 
    ("FONTSIZE", (0, 0), (-1, -1), 8),   # 🔹 también reducido
    ("BOTTOMPADDING", (0, 0), (-1, 0), 6), 
    ("BACKGROUND", (0, 1), (-1, -1), colors.whitesmoke), 
    ("GRID", (0, 0), (-1, -1), 0.5, colors.grey), 
])) 

elements.append(Paragraph("Descripción de tareas", styles["Heading2"])) 
elements.append(table_resumen) 

# ===============================
# Construir PDF 
doc.build(elements) 
print(f"✅ PDF generado: {pdf_filename}")
