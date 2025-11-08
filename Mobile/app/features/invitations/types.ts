export interface Invitation {
  id: number;
  email: string;
  role: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  projectId: number;
  createdAt?: string;
  updatedAt?: string;
  project?: {
    id: number;
    name: string;
  };
}
