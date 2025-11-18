import React from "react";
import { View, Dimensions } from "react-native";
import { CartesianChart, useChartTransformState, Line, useChartPressState, Bar } from "victory-native";
import { useFont, Skia } from "@shopify/react-native-skia";
import { format } from "date-fns";
import { useThemedColors } from '@/hooks/use-theme-color';

interface BurndownChartProps {
  data: { x: string; y: number }[];
  color?: string;
  label?: string;
  type?: "line" | "bar";
}

export function StatsBurndownChart({ data, color = "#0a7ea4", label, type="line" }: BurndownChartProps) {
  const { TEXT, SUBTEXT, CARD_BG, CARD_BORDER, isDark, CHART_BG } = useThemedColors();
  const screenWidth = Dimensions.get('window').width;
  const { state, isActive } = useChartPressState({ x: '', y: { y: 0 } });
  
  // Cargar fuente del sistema o fallback
  const font = useFont(require("../../../../assets/fonts/GoogleSansCode-VariableFont_wght.ttf"), 12);

  const { state: transformState } = useChartTransformState({
    scaleX: 1,
    scaleY: 0.9,
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
    <View style={{ 
      height: 300, 
      width: screenWidth - 50,
      backgroundColor: CHART_BG,
    }}>
      <CartesianChart 
        transformState={transformState}
        transformConfig={{
          pan: {
            activateAfterLongPress: 100,
          },
        }}
        data={data} 
        xKey="x" 
        yKeys={["y"]}
        axisOptions={{
          font, 
          tickCount: { x: 5, y: 10 },
          formatXLabel: formatDate,
          labelColor: {x: TEXT, y: TEXT},
        }}


      >
        {({ points, chartBounds}) => (
         <>
            {type === "bar" ? (
              <Bar
                points={points.y}
                chartBounds={chartBounds}
                color={color}
                animate={{ type: "timing", duration: 300 }}
                barWidth={20}
                roundedCorners={{ topLeft: 4, topRight: 4 }}
              />
            ) : (
              <Line
                points={points.y}
                color={color}
                strokeWidth={3}
                animate={{ type: "timing", duration: 300 }}
              />
            )}
          </>
        )}
      </CartesianChart>
    </View>
  );
}