    import React from "react";
    import { View, Text, ScrollView, ActivityIndicator } from "react-native";
    import { useTaskHistory } from "../hooks/usetask";

    interface Props {
    taskId: number | string;
    }

    export default function TaskHistory({ taskId }: Props) {
    const { history, loading, error } = useTaskHistory(taskId);

    if (loading)
        return (
        <View className="flex-1 justify-center items-center mt-10">
            <ActivityIndicator size="large" color="#3B34FF" />
        </View>
        );

    if (error)
        return (
        <View className="p-4">
            <Text className="text-red-500">Error: {error}</Text>
        </View>
        );

    if (!history.length)
        return (
        <View className="flex-1 justify-center items-center mt-10">
            <Text className="text-gray-500">No hay historial para esta tarea.</Text>
        </View>
        );

    return (
        <ScrollView className="p-4">
        {history.map((entry, index) => (
            <View key={entry.id} className="mb-5">
            <View className="flex-row items-center">
                <View
                className={`h-3 w-3 rounded-full ${
                    entry.action.action === "DELETED"
                    ? "bg-red-500"
                    : entry.action.action === "UPDATED"
                    ? "bg-yellow-400"
                    : entry.action.action === "CREATED"
                    ? "bg-green-500"
                    : "bg-blue-500"
                }`}
                />
                <Text className="ml-2 font-semibold text-gray-700">
                {entry.action.action}
                </Text>
            </View>

            <Text className="text-gray-800 mt-1">{entry.description}</Text>
            <Text className="text-gray-500 text-sm mt-1">
                Por {entry.user?.name ?? "Usuario desconocido"} ·{" "}
                {new Date(entry.date).toLocaleString("es-CL")}
            </Text>

            {index < history.length - 1 && (
                <View className="h-[1px] bg-gray-200 my-3" />
            )}
            </View>
        ))}
        </ScrollView>
    );
    }
