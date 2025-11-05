export interface Invitation {
  id: number;
  email: string;
  invitedUserId?: number | null;
  invitedById: number;
  projectId: number;
  role: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}
