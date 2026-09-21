import { apiFetch, fetchListOrEmpty } from "./client";
import type { Guest } from "../types";

export interface RegisterGuestPayload {
  guestFirstName: string;
  guestLastName: string;
  guestContact: string;
  guestEmail: string;
  guestPassword: string;
}

export interface LoginGuestPayload {
  guestContact: string;
}

export interface LoginGuestResponse {
  message: string;
  token: string;
  host: {
    guestId: string;
    guestFirstName: string;
    guestLastName: string;
    role: string;
  };
}

export function registerGuest(payload: RegisterGuestPayload) {
  return apiFetch<{ message: string; data: Guest[] }>("/auth/guest/register", {
    method: "POST",
    body: payload,
  });
}

/**
 * NOTE: the backend's guest login endpoint currently only looks the guest up
 * by `guestContact` and does not verify a password. We still collect a
 * password in the UI for a familiar flow and forward it in case the backend
 * is updated to check it, but don't rely on it for access control.
 */
export function loginGuest(payload: LoginGuestPayload & { guestPassword?: string }) {
  return apiFetch<LoginGuestResponse>("/auth/guest/login", {
    method: "POST",
    body: payload,
  });
}

export function getAllGuests(token: string) {
  return fetchListOrEmpty<Guest>("/auth/guests", { token });
}

export function getGuestById(guestId: string, token: string) {
  return fetchListOrEmpty<Guest>(`/auth/guest/guestbyid/${guestId}`, { token });
}

export function getGuestByContact(guestContact: string, token: string) {
  return fetchListOrEmpty<Guest>(`/auth/guest/guestbycontact/${guestContact}`, { token });
}

export function getGuestByRoom(guestRoomNum: string, token: string) {
  return fetchListOrEmpty<Guest>(`/auth/guest/guestbyroomnum/${guestRoomNum}`, { token });
}

export function updateGuest(guestContact: string, payload: Partial<RegisterGuestPayload & { guestRoomNumber: string | null }>, token: string) {
  return apiFetch<{ message: string; data: Guest }>(`/auth/guest/updateguest/${guestContact}`, {
    method: "PATCH",
    body: payload,
    token,
  });
}

export function deleteGuestByContact(guestContact: string, token: string) {
  return apiFetch<{ message: string }>(`/auth/guest/deleteguestbycontact/${guestContact}`, {
    method: "DELETE",
    token,
  });
}

export function deleteGuestById(guestId: string, token: string) {
  return apiFetch<{ message: string }>(`/auth/guest/deleteguestbyid/${guestId}`, {
    method: "DELETE",
    token,
  });
}
