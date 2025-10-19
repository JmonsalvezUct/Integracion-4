    export interface Tag {
    id: number;
    name: string;
    color?: string | null;
    projectId?: number;
    }


    export interface Task {
    id: number;
    title: string;
    status?: string;
    description?: string; 
    priority?: "high" | "medium" | "low" | undefined;
    dueDate?: string | null;
    assignee?: { name?: string | null } | null;
    project?: { name?: string };
    tags?: { tag: Tag }[];
    }

    export interface User {
    id: number;
    name: string;
    }