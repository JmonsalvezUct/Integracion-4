import { apiFetch } from "@/lib/api-fetch";

export async function createInvitation(projectId: number, body: { email: string; role: string }) {
  const res = await apiFetch(`/invitations/projects/${projectId}`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function listProjectInvitations(projectId: number, status?: string) {
  const qs = status ? `?status=${status}` : "";
  const res = await apiFetch(`/invitations/projects/${projectId}${qs}`);
  return res.json();
}

export async function listMyInvitations() {
  const res = await apiFetch(`/invitations/me`);
  return res.json();
}

export async function acceptInvitation(id: number) {
  const res = await apiFetch(`/invitations/${id}/accept`, { method: "POST" });
  return res.json();
}

export async function rejectInvitation(id: number) {
  const res = await apiFetch(`/invitations/${id}/reject`, { method: "POST" });
  return res.json();
}
