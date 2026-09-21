import { apiFetch, fetchListOrEmpty } from "./client";
import type { Host } from "../types";

export interface RegisterHostPayload {
  firstName: string;
  lastName: string;
  hostEmail: string;
  hostContact: string;
  hostPasswordHash: string; // plain-text password; the backend hashes it server-side
}

export interface LoginHostPayload {
  hostEmail: string;
  hostPasswordHash: string; // plain-text password field name, kept to match the API
}

export interface LoginHostResponse {
  message: string;
  token: string;
  host: {
    hostAdminId: string;
    firstName: string;
    lastName: string;
    hostEmail: string;
    role: string;
  };
}

export function registerHost(payload: RegisterHostPayload) {
  return apiFetch<{ message: string; data: Host[] }>("/auth/register", {
    method: "POST",
    body: payload,
  });
}

export function loginHost(payload: LoginHostPayload) {
  return apiFetch<LoginHostResponse>("/auth/loginhost", {
    method: "POST",
    body: payload,
  });
}

export function getAllHosts(token: string) {
  return fetchListOrEmpty<Host>("/auth/hosts/get", { token });
}

export function getHostById(hostAdminId: string, token: string) {
  return apiFetch<{ data: Host }>(`/auth/hosts/getbyid/${hostAdminId}`, { token });
}

export function updateHost(hostAdminId: string, payload: Partial<RegisterHostPayload>, token: string) {
  return apiFetch<{ message: string; data: Host[] }>(`/auth/hosts/update/${hostAdminId}`, {
    method: "PATCH",
    body: payload,
    token,
  });
}

export function deleteHost(hostAdminId: string, token: string) {
  return apiFetch<{ message: string }>(`/auth/hosts/delete/${hostAdminId}`, {
    method: "DELETE",
    token,
  });
}
