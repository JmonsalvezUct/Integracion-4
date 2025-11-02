import React from "react";
import { View, Dimensions } from "react-native";
import { CartesianChart, useChartTransformState, Line, useChartPressState } from "victory-native";
import { useFont } from "@shopify/react-native-skia";
// Importamos la librería 'date-fns' o similar para un buen formato de fechas
import { format } from "date-fns"; 

interface BurndownChartProps {
  data: { x: string; y: number }[];
  color?: string;
  label?: string;
}

export function StatsBurndownChart({ data, color = "#1976d2", label }: BurndownChartProps) {
  const screenWidth = Dimensions.get('window').width;
  const { state, isActive } = useChartPressState({ x: '', y: { y: 0 } });
  
  const font = useFont(require("../../../../assets/fonts/GoogleSansCode-VariableFont_wght.ttf"), 12); //necesario para que se muestren los ejes
  const {state: transformState} = useChartTransformState({
    scaleX: 1, // Initial X-axis scale
    scaleY: 0.9, // Initial Y-axis scale
  });
  console.log("data en statsburndownchart", data);
  
  // Función para formatear las fechas:
  const formatDate = (value: string | number | Date) => {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return ''; 
    }
    date.setDate(date.getDate() + 1);

    return format(date, 'dd/MM');
  };

  return (
    <View style={{ height: 300, width: screenWidth - 50 }}>
      <CartesianChart 
        transformState={transformState}
        transformConfig={{
            pan: {
            activateAfterLongPress: 100, // Delay in ms before pan gesture activates
            },
        }}
        data={data} 
        xKey="x" 
        yKeys={["y"]}
        axisOptions={{
            font, 
            tickCount: {x:5, y: 10},
            formatXLabel: formatDate, 
        }}
      >
        {({ points }) => (
            <Line
                points={points.y}
                color={color}
                strokeWidth={3}
                animate={{ type: "timing", duration: 300 }}
            />
        )}
      </CartesianChart>
    </View>
  );
}
