
export type ProjectDetail = {
  id: number;
  name: string;
  description?: string | null;
  status?: string;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
};

export type Owner = {
  id: number;
  name?: string;
  email?: string;
  role?: string;
};

export type Member = {
  id: number;
  name?: string;
  email?: string;
  role: string;
};

export type TaskMetrics = {
  totalTasks: number;
  tasksByStatus: {
    created: number;
    in_progress: number;
    completed: number;
  };
  tasksByMember: Array<{
    memberId: number;
    memberName: string;
    taskCount: number;
  }>;
};

export type Task = {
  id: number;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string;
  assignee?: {
    id: number;
    name: string;
  };
  assigneeId?: number;
  assigneeld?: number;
  _status?: string;
  projectId?: number;
  tile?: string;
};