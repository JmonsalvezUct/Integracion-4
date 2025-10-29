// mobile/types/user.ts
// Define el tipo de datos del usuario
export interface User {
  id: number;
  name: string | null;
  email: string;
  profilePicture?: string | null;
}
