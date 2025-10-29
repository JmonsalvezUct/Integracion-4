    import React, { useEffect, useState } from "react";
    import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";

    const PRIMARY = "#3B34FF";
    const TAG_BG = "#EAE8FF";

    interface Tag {
    id: number;
    name: string;
    color?: string;
    projectId: number;
    }

    interface TagPickerProps {
    projectId: number;
    selectedTags: number[];
    onChange: (selected: number[]) => void;
    }

    export default function TagPicker({ projectId, selectedTags, onChange }: TagPickerProps) {
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchTags();
    }, [projectId]);

    const fetchTags = async () => {
        setLoading(true);
        try {
        const res = await fetch(`http://localhost:3000/api/tags/project/${projectId}`);
        const data = await res.json();
        setTags(data);
        } catch (error) {
        console.error("Error al obtener etiquetas:", error);
        } finally {
        setLoading(false);
        }
    };

    const toggleTag = (tagId: number) => {
        if (selectedTags.includes(tagId)) {
        onChange(selectedTags.filter((id) => id !== tagId));
        } else {
        onChange([...selectedTags, tagId]);
        }
    };

    if (loading) {
        return (
        <View style={{ paddingVertical: 10 }}>
            <ActivityIndicator color={PRIMARY} />
        </View>
        );
    }

    return (
        <View style={{ marginVertical: 12 }}>
        <Text style={{ fontWeight: "600", fontSize: 16, marginBottom: 8, color: "#1E1E1E" }}>
            Etiquetas
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {tags.map((tag) => {
            const isSelected = selectedTags.includes(tag.id);
            const tagColor = tag.color || PRIMARY;

            return (
                <TouchableOpacity
                key={tag.id}
                onPress={() => toggleTag(tag.id)}
                activeOpacity={0.8}
                style={{
                    backgroundColor: isSelected ? tagColor : TAG_BG,
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 20,
                    marginRight: 10,
                    shadowColor: "#000",
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                    elevation: 1,
                }}
                >
                <Text
                    style={{
                    color: isSelected ? "#FFF" : PRIMARY,
                    fontWeight: "600",
                    }}
                >
                    {tag.name}
                </Text>
                </TouchableOpacity>
            );
            })}
        </ScrollView>
        </View>
    );
    }
