import { apiFetch, fetchListOrEmpty } from "./client";
import type { Approval, ApprovalStatus } from "../types";

export interface ApprovalPayload {
  approvedRoomNum: string;
  approvingHostId: string;
  approvedGuestId: string;
  roomAprovalStatus: ApprovalStatus;
}

export function createApproval(payload: ApprovalPayload, token: string) {
  return apiFetch<{ message: string; data: Approval }>("/auth/approval/create", {
    method: "POST",
    body: payload,
    token,
  });
}

export function getAllApprovals(token: string) {
  return fetchListOrEmpty<Approval>("/auth/approvals", { token });
}

export function getApprovalById(approvalId: string, token: string) {
  return apiFetch<{ data: Approval }>(`/auth/approvals/approvalbyid/${approvalId}`, { token });
}

export function getApprovalsByRoomNum(roomNum: string, token: string) {
  return fetchListOrEmpty<Approval>(`/auth/approvals/approvalbyroomnum/${roomNum}`, { token });
}

export function getApprovalsByGuestId(guestId: string, token: string) {
  return fetchListOrEmpty<Approval>(`/auth/approvals/approvalbyguestid/${guestId}`, { token });
}

export function getApprovalsByHostId(hostAdminId: string, token: string) {
  return fetchListOrEmpty<Approval>(`/auth/approvals/approvalbyhostid/${hostAdminId}`, { token });
}

export function getPendingApprovals(token: string) {
  return fetchListOrEmpty<Approval>("/auth/approvals/pending", { token });
}

export function getApprovedApprovals(token: string) {
  return fetchListOrEmpty<Approval>("/auth/approvals/approved", { token });
}

export function getRejectedApprovals(token: string) {
  return fetchListOrEmpty<Approval>("/auth/approvals/rejected", { token });
}

export function updateApprovalById(approvalId: string, payload: Partial<ApprovalPayload>, token: string) {
  return apiFetch<{ message: string; data: Approval }>(`/auth/approvals/update/updatebyid/${approvalId}`, {
    method: "PATCH",
    body: payload,
    token,
  });
}

export function updateApprovalByRoomNum(roomNum: string, payload: Partial<ApprovalPayload>, token: string) {
  return apiFetch<{ message: string; data: Approval }>(`/auth/approvals/update/updatebyroomnum/${roomNum}`, {
    method: "PATCH",
    body: payload,
    token,
  });
}

export function updateApprovalByGuestId(guestId: string, payload: Partial<ApprovalPayload>, token: string) {
  return apiFetch<{ message: string; data: Approval }>(`/auth/approvals/update/updatebyguestid/${guestId}`, {
    method: "PATCH",
    body: payload,
    token,
  });
}

// NOTE: the backend registers these two "delete" routes with `.patch(...)`
// instead of `.delete(...)` (see src/approvals/approvals.route.ts), so a real
// DELETE request 404s. We call them with PATCH to match what's actually wired up.
export function deleteApprovalById(approvalId: string, token: string) {
  return apiFetch<{ message: string }>(`/auth/approvals/delete/deletebyid/${approvalId}`, {
    method: "PATCH",
    token,
  });
}

export function deleteApprovalByRoomNum(roomNum: string, token: string) {
  return apiFetch<{ message: string }>(`/auth/approvals/delete/deletebyroomnum/${roomNum}`, {
    method: "PATCH",
    token,
  });
}
