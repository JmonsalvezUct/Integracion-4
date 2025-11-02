    // hooks/useSprints.ts
    import { useState, useEffect } from "react";
    import { apiFetch } from "@/lib/api-fetch";
    import { Alert } from "react-native";

    export type Sprint = {
    id: number;
    name: string;
    description?: string;
    startDate: string;
    endDate?: string;
    isActive: boolean;
    };

    export function useSprints(projectId: string | number | undefined) {
    const [sprints, setSprints] = useState<Sprint[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchSprints = async () => {
        try {
        setLoading(true);
        const res = await apiFetch(`/projects/${projectId}/sprints`);
        const data = await res.json();
        setSprints(data);
        } catch (error) {
        console.error("Error cargando sprints:", error);
        Alert.alert("Error", "No se pudieron cargar los sprints.");
        } finally {
        setLoading(false);
        }
    };

    const deleteSprint = async (id: number) => {
        try {
        await apiFetch(`/projects/${projectId}/sprints/${id}`, { method: "DELETE" });
        fetchSprints();
        } catch (err) {
        console.error("Error eliminando sprint:", err);
        }
    };

    const finalizeSprint = async (id: number) => {
        try {
        await apiFetch(`/projects/${projectId}/sprints/${id}/finalize`, { method: "PATCH" });
        fetchSprints();
        } catch (err) {
        console.error("Error finalizando sprint:", err);
        }
    };

    useEffect(() => {
        if (projectId) fetchSprints();
    }, [projectId]);

    return { sprints, loading, fetchSprints, deleteSprint, finalizeSprint };
    }
