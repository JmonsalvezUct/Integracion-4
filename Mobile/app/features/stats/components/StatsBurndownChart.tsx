import React from "react";
import { View, Dimensions } from "react-native";
import { CartesianChart, useChartTransformState,  Line } from "victory-native";

interface BurndownChartProps {
  data: { x: string; y: number }[];
  color?: string;
  label?: string;
}

export function StatsBurndownChart({ data, color = "#1976d2", label }: BurndownChartProps) {
  const screenWidth = Dimensions.get('window').width;
  const {state: transformState} = useChartTransformState({
    scaleX: 1.5, // Initial X-axis scale
    scaleY: 1.0, // Initial Y-axis scale
  });
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
          formatXLabel: (value) => {
            const date = new Date(value);
            return `${date.getDate()}/${date.getMonth() + 1}`;
          },
          formatYLabel: (value) => Math.round(value).toString(),
          tickCount: { x: 5, y: 5 },
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

