
    import { useState } from "react";
    import { Alert } from "react-native";
    import { apiFetch } from "@/lib/api-fetch";
    import { getAccessToken } from "@/lib/secure-store";
    export function useSprintForm(projectId: string | number | undefined, onSuccess: () => void) {
    const [newSprint, setNewSprint] = useState({
        name: "",
        description: "",
        startDate: "",
        endDate: "",
    });

    const [dateErrors, setDateErrors] = useState({ startDate: "", endDate: "" });

    const formatDateInput = (value: string) => {
        const digits = value.replace(/\D/g, "");
        if (digits.length <= 2) return digits;
        if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
        return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
    };

    const validateDate = (value: string): string => {
        if (!value) return "La fecha es obligatoria.";
        if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return "Formato inválido. Usa DD/MM/AAAA.";
        const [d, m, y] = value.split("/").map(Number);
        const date = new Date(y, m - 1, d);
        if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d)
        return "La fecha no es válida.";
        return "";
    };

    const createSprint = async (): Promise<boolean> => {

        const startError = validateDate(newSprint.startDate);
        const endError = validateDate(newSprint.endDate);

        setDateErrors({ startDate: startError, endDate: endError });

        if (startError || endError) {
            Alert.alert("Error", "Corrige las fechas antes de continuar.");
            return false;
        }

        const parseISO = (d: string) => {
            const [day, month, year] = d.split("/");
            return `${year}-${month}-${day}`;
        };

        const formatted = {
            ...newSprint,
            startDate: parseISO(newSprint.startDate),
            endDate: parseISO(newSprint.endDate),
        };

        try {
            const token = await getAccessToken();

            const res = await apiFetch(`/projects/${projectId}/sprints`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formatted),
            });

            if (!res.ok) throw new Error(await res.text());

            Alert.alert("Éxito", "Sprint creado correctamente.");
            setNewSprint({ name: "", description: "", startDate: "", endDate: "" });
            onSuccess();
            return true;

        } catch (err) {
            console.error("❌ Error creando sprint:", err);
            Alert.alert("Error", "No se pudo crear el sprint.");
            return false;
        }
    };

    return {
    newSprint,
    setNewSprint,
    dateErrors,
    setDateErrors,
    formatDateInput,
    validateDate,
    createSprint,
    };

    }
