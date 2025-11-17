export interface ProjectMember {
  id: number;
  userId: number;
  projectId: number;
  role: "admin" | "developer" | "guest";
  user: {
    id: number;
    name: string;
    email: string;
    profilePicture?: string | null;
  };
}
