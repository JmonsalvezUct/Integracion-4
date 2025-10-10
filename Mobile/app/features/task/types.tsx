    export interface Task {
    id: number;
    title: string;
    status?: string;
    priority?: "high" | "medium" | "low" | undefined;
    dueDate?: string | null;
    assignee?: { name?: string | null } | null;
    project?: { name?: string };
    }

    export interface User {
    id: number;
    name: string;
    }